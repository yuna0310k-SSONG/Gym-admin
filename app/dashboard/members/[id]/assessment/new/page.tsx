"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Radio from "@/components/ui/Radio";
import RadioGroup from "@/components/ui/RadioGroup";
import Checkbox from "@/components/ui/Checkbox";
import Card from "@/components/ui/Card";
import { assessmentApi } from "@/lib/api/assessments";
import type { CreateAssessmentRequest } from "@/types/api/requests";
import { useToast } from "@/providers/ToastProvider";

interface AssessmentFormData {
  assessedAt: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  trainerComment?: string;

  // 하체 근력
  strengthGrade: "A" | "B" | "C" | "D" | "";
  strengthAlternative?: "D-1" | "D-2" | "";

  // 심폐 지구력
  cardioGrade: "A" | "B" | "C" | "";
  recoverySpeed: string[];

  // 근지구력
  enduranceGrade: "A" | "B" | "C" | "";

  // 유연성
  flexibilityItems: {
    sitAndReach?: "A" | "B" | "C" | "";
    shoulder?: "A" | "B" | "C" | "";
    hip?: "A" | "B" | "C" | "";
    hamstring?: "A" | "B" | "C" | "";
  };

  // 체성분
  bodyWeightInput?: number;
  muscleMass?: number;
  fatMass?: number;
  bodyFatPercentage?: number;

  // 안정성
  ohsa: "A" | "B" | "C" | "";
  pain: "none" | "present" | "";
}

export default function NewInitialAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const memberId = params.id as string;

  const [formData, setFormData] = useState<AssessmentFormData>({
    assessedAt: new Date().toISOString().split("T")[0],
    strengthGrade: "",
    strengthAlternative: "",
    cardioGrade: "",
    recoverySpeed: [],
    enduranceGrade: "",
    flexibilityItems: {},
    ohsa: "",
    pain: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.assessedAt) {
      newErrors.assessedAt = "평가일을 선택해주세요.";
    }

    // 하체 근력 검증
    if (!formData.strengthGrade) {
      newErrors.strengthGrade = "하체 근력 평가를 선택해주세요.";
    } else if (formData.strengthGrade === "D" && !formData.strengthAlternative) {
      newErrors.strengthAlternative = "대체 항목을 선택해주세요.";
    }

    // 심폐 지구력 검증
    if (!formData.cardioGrade) {
      newErrors.cardioGrade = "심폐 지구력 평가를 선택해주세요.";
    }

    // 근지구력 검증
    if (!formData.enduranceGrade) {
      newErrors.enduranceGrade = "근지구력 평가를 선택해주세요.";
    }

    // 유연성 검증 (최소 1개 항목)
    const flexibilityCount = Object.values(formData.flexibilityItems).filter(
      (v) => v !== "" && v !== undefined
    ).length;
    if (flexibilityCount === 0) {
      newErrors.flexibility = "유연성 평가 항목을 최소 1개 이상 선택해주세요.";
    }

    // 체성분 검증
    if (
      !formData.muscleMass ||
      !formData.fatMass ||
      !formData.bodyFatPercentage
    ) {
      newErrors.bodyComposition = "체성분 데이터를 모두 입력해주세요.";
    }

    // 안정성 검증
    if (!formData.ohsa) {
      newErrors.ohsa = "OHSA 평가를 선택해주세요.";
    }
    if (!formData.pain) {
      newErrors.pain = "통증 체크를 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("필수 항목을 모두 입력해주세요.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      // 요청 데이터 구성
      const items: CreateAssessmentRequest["items"] = [];

      // 1. 하체 근력
      if (formData.strengthGrade === "D" && formData.strengthAlternative) {
        // 대체 항목
        items.push({
          category: "STRENGTH",
          name: formData.strengthAlternative === "D-1" ? "박스 스쿼트" : "고블릿 스쿼트",
          details: {
            grade: formData.strengthAlternative,
          },
        });
      } else if (formData.strengthGrade !== "D") {
        items.push({
          category: "STRENGTH",
          name: "체중 스쿼트",
          details: {
            grade: formData.strengthGrade,
          },
        });
      }

      // 2. 심폐 지구력
      items.push({
        category: "CARDIO",
        name: "스텝 테스트",
        details: {
          grade: formData.cardioGrade,
          recoverySpeed:
            formData.cardioGrade === "B" && formData.recoverySpeed.length > 0
              ? formData.recoverySpeed
              : undefined,
        },
      });

      // 3. 근지구력
      items.push({
        category: "ENDURANCE",
        name: "플랭크",
        details: {
          grade: formData.enduranceGrade,
        },
      });

      // 4. 유연성
      const flexibilityItems = Object.entries(formData.flexibilityItems)
        .filter(([_, value]) => value !== "" && value !== undefined)
        .reduce((acc, [key, value]) => {
          acc[key as keyof typeof acc] = value as "A" | "B" | "C";
          return acc;
        }, {} as Record<string, "A" | "B" | "C">);

      if (Object.keys(flexibilityItems).length > 0) {
        items.push({
          category: "FLEXIBILITY",
          name: "유연성 종합",
          details: {
            flexibilityItems,
          },
        });
      }

      // 5. 체성분
      items.push({
        category: "BODY",
        name: "인바디",
        value: formData.bodyWeightInput || formData.bodyWeight,
        unit: "kg",
        details: {
          muscleMass: formData.muscleMass,
          fatMass: formData.fatMass,
          bodyFatPercentage: formData.bodyFatPercentage,
        },
      });

      // 6. 안정성
      items.push({
        category: "STABILITY",
        name: "OHSA",
        details: {
          ohsa: formData.ohsa,
          pain: formData.pain,
        },
      });

      const requestData: CreateAssessmentRequest = {
        assessmentType: "INITIAL",
        assessedAt: formData.assessedAt,
        bodyWeight: formData.bodyWeight,
        condition: formData.condition,
        trainerComment: formData.trainerComment,
        items,
      };

      await assessmentApi.createAssessment(memberId, requestData);

      showToast("초기 평가가 생성되었습니다.", "success");
      router.push(`/dashboard/members/${memberId}`);
    } catch (error) {
      console.error("평가 생성 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "평가 생성에 실패했습니다.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySpeedChange = (value: string, checked: boolean) => {
    setFormData((prev) => {
      const newSpeed = checked
        ? [...prev.recoverySpeed, value]
        : prev.recoverySpeed.filter((v) => v !== value);
      return { ...prev, recoverySpeed: newSpeed };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href={`/dashboard/members/${memberId}`}
          className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block"
        >
          ← 회원 상세로 돌아가기
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          초기 평가 생성
        </h1>
        <p className="text-[#9ca3af] mt-2">
          회원의 초기 평가를 진행합니다. 모든 항목을 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card title="기본 정보" className="bg-[#0f1115]">
          <div className="space-y-4">
            <Input
              type="date"
              label="평가일"
              value={formData.assessedAt}
              onChange={(e) =>
                setFormData({ ...formData, assessedAt: e.target.value })
              }
              error={errors.assessedAt}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="체중 (kg)"
                value={formData.bodyWeight || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bodyWeight: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                step="0.1"
              />

              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-1">
                  컨디션
                </label>
                <select
                  className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.condition || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition: e.target.value as any,
                    })
                  }
                >
                  <option value="">선택하세요</option>
                  <option value="EXCELLENT">매우 좋음</option>
                  <option value="GOOD">좋음</option>
                  <option value="NORMAL">보통</option>
                  <option value="POOR">나쁨</option>
                </select>
              </div>
            </div>

            <Input
              label="트레이너 코멘트"
              value={formData.trainerComment || ""}
              onChange={(e) =>
                setFormData({ ...formData, trainerComment: e.target.value })
              }
              placeholder="평가 시 관찰한 내용을 기록해주세요."
            />
          </div>
        </Card>

        {/* 1. 하체 근력 */}
        <Card title="1. 하체 근력" className="bg-[#0f1115]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                체중 스쿼트 수행 상태 <span className="text-red-400">*</span>
              </label>
              <RadioGroup
                name="strengthGrade"
                value={formData.strengthGrade}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    strengthGrade: value as any,
                    strengthAlternative: value !== "D" ? "" : undefined,
                  })
                }
              >
                <Radio value="A" label="안정적으로 반복 수행" />
                <Radio value="B" label="수행 가능, 깊이·정렬 일부 제한" />
                <Radio value="C" label="수행 가능하나 불안정 / 연속 어려움" />
                <Radio value="D" label="수행 불가 → 대체 항목" />
              </RadioGroup>
              {errors.strengthGrade && (
                <p className="mt-1 text-sm text-red-400">{errors.strengthGrade}</p>
              )}
            </div>

            {formData.strengthGrade === "D" && (
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                  대체 항목 <span className="text-red-400">*</span>
                </label>
                <RadioGroup
                  name="strengthAlternative"
                  value={formData.strengthAlternative || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      strengthAlternative: value as any,
                    })
                  }
                >
                  <Radio value="D-1" label="체어/박스 스쿼트 가능" />
                  <Radio value="D-2" label="보조 있어도 어려움" />
                </RadioGroup>
                {errors.strengthAlternative && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.strengthAlternative}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* 2. 심폐 지구력 */}
        <Card title="2. 심폐 지구력" className="bg-[#0f1115]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                스텝 테스트 수행 상태 <span className="text-red-400">*</span>
              </label>
              <RadioGroup
                name="cardioGrade"
                value={formData.cardioGrade}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    cardioGrade: value as any,
                    recoverySpeed: value !== "B" ? [] : formData.recoverySpeed,
                  })
                }
              >
                <Radio value="A" label="리듬 유지 + 완주" />
                <Radio value="B" label="리듬 유지" />
                <Radio value="C" label="조기 중단 / 리듬 붕괴" />
              </RadioGroup>
              {errors.cardioGrade && (
                <p className="mt-1 text-sm text-red-400">{errors.cardioGrade}</p>
              )}
            </div>

            {formData.cardioGrade === "B" && (
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                  회복 속도 (선택)
                </label>
                <div className="space-y-2">
                  <Checkbox
                    label="회복 빠름 (1분 이내 호흡 편안)"
                    checked={formData.recoverySpeed.includes("fast")}
                    onChange={(e) =>
                      handleRecoverySpeedChange("fast", e.target.checked)
                    }
                  />
                  <Checkbox
                    label="회복 느림 (2분 이상 호흡 불편)"
                    checked={formData.recoverySpeed.includes("slow")}
                    onChange={(e) =>
                      handleRecoverySpeedChange("slow", e.target.checked)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 3. 근지구력 */}
        <Card title="3. 근지구력" className="bg-[#0f1115]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                플랭크 수행 상태 <span className="text-red-400">*</span>
              </label>
              <RadioGroup
                name="enduranceGrade"
                value={formData.enduranceGrade}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    enduranceGrade: value as any,
                  })
                }
              >
                <Radio value="A" label="자세 안정, 흔들림 거의 없음" />
                <Radio value="B" label="유지 가능하나 흔들림 있음" />
                <Radio value="C" label="빠른 붕괴 / 중단" />
              </RadioGroup>
              {errors.enduranceGrade && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.enduranceGrade}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* 4. 유연성 */}
        <Card title="4. 유연성" className="bg-[#0f1115]">
          <div className="space-y-4">
            <p className="text-sm text-[#9ca3af] mb-4">
              최소 1개 항목 이상 선택해주세요. <span className="text-red-400">*</span>
            </p>
            {errors.flexibility && (
              <p className="text-sm text-red-400 mb-2">{errors.flexibility}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                좌전굴
              </label>
              <RadioGroup
                name="sitAndReach"
                value={formData.flexibilityItems.sitAndReach || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    flexibilityItems: {
                      ...formData.flexibilityItems,
                      sitAndReach: value as any,
                    },
                  })
                }
              >
                <Radio value="A" label="제한 없음" />
                <Radio value="B" label="일부 제한" />
                <Radio value="C" label="명확한 제한" />
              </RadioGroup>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                어깨 가동
              </label>
              <RadioGroup
                name="shoulder"
                value={formData.flexibilityItems.shoulder || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    flexibilityItems: {
                      ...formData.flexibilityItems,
                      shoulder: value as any,
                    },
                  })
                }
              >
                <Radio value="A" label="제한 없음" />
                <Radio value="B" label="일부 제한" />
                <Radio value="C" label="명확한 제한" />
              </RadioGroup>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                고관절 가동
              </label>
              <RadioGroup
                name="hip"
                value={formData.flexibilityItems.hip || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    flexibilityItems: {
                      ...formData.flexibilityItems,
                      hip: value as any,
                    },
                  })
                }
              >
                <Radio value="A" label="제한 없음" />
                <Radio value="B" label="일부 제한" />
                <Radio value="C" label="명확한 제한" />
              </RadioGroup>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                햄스트링 (선택)
              </label>
              <RadioGroup
                name="hamstring"
                value={formData.flexibilityItems.hamstring || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    flexibilityItems: {
                      ...formData.flexibilityItems,
                      hamstring: value as any,
                    },
                  })
                }
              >
                <Radio value="A" label="제한 없음" />
                <Radio value="B" label="일부 제한" />
                <Radio value="C" label="명확한 제한" />
              </RadioGroup>
            </div>
          </div>
        </Card>

        {/* 5. 체성분 */}
        <Card title="5. 체성분" className="bg-[#0f1115]">
          <div className="space-y-4">
            {errors.bodyComposition && (
              <p className="text-sm text-red-400">{errors.bodyComposition}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="체중 (kg)"
                value={formData.bodyWeightInput || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bodyWeightInput: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                step="0.1"
                required
              />
              <Input
                type="number"
                label="골격근량 (kg)"
                value={formData.muscleMass || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    muscleMass: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                step="0.1"
                required
              />
              <Input
                type="number"
                label="체지방량 (kg)"
                value={formData.fatMass || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fatMass: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                step="0.1"
                required
              />
              <Input
                type="number"
                label="체지방률 (%)"
                value={formData.bodyFatPercentage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bodyFatPercentage: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                step="0.1"
                required
              />
            </div>
          </div>
        </Card>

        {/* 6. 안정성 */}
        <Card title="6. 안정성" className="bg-[#0f1115]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                OHSA 종합 <span className="text-red-400">*</span>
              </label>
              <RadioGroup
                name="ohsa"
                value={formData.ohsa}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    ohsa: value as any,
                  })
                }
              >
                <Radio value="A" label="보상 거의 없음" />
                <Radio value="B" label="경미한 보상" />
                <Radio value="C" label="명확한 보상" />
              </RadioGroup>
              {errors.ohsa && (
                <p className="mt-1 text-sm text-red-400">{errors.ohsa}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                통증 체크 <span className="text-red-400">*</span>
              </label>
              <RadioGroup
                name="pain"
                value={formData.pain}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    pain: value as any,
                  })
                }
              >
                <Radio value="none" label="없음" />
                <Radio value="present" label="있음" />
              </RadioGroup>
              {errors.pain && (
                <p className="mt-1 text-sm text-red-400">{errors.pain}</p>
              )}
            </div>
          </div>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <Link href={`/dashboard/members/${memberId}`}>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              취소
            </Button>
          </Link>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "평가 저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}

