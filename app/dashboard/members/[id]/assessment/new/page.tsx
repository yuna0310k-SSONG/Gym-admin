"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Radio from "@/components/ui/Radio";
import RadioGroup from "@/components/ui/RadioGroup";
import Checkbox from "@/components/ui/Checkbox";
import Card from "@/components/ui/Card";
import { assessmentApi } from "@/lib/api/assessments";
import { memberApi } from "@/lib/api/members";
import type { CreateAssessmentRequest } from "@/types/api/requests";
import type { Member } from "@/types/api/responses";
import { useToast } from "@/providers/ToastProvider";

interface AssessmentFormData {
  assessedAt: string;
  height?: number;
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
  const [member, setMember] = useState<Member | null>(null);

  // 회원 정보 가져오기
  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId) return;

      try {
        const memberData = await memberApi.getMember(memberId);
        setMember(memberData);

        // 회원의 키와 몸무게가 있으면 자동으로 채우기
        setFormData((prev) => {
          const updates: Partial<AssessmentFormData> = {};

          if (
            memberData.height !== undefined &&
            memberData.height !== null &&
            !isNaN(memberData.height)
          ) {
            updates.height = memberData.height;
          }

          if (
            memberData.weight !== undefined &&
            memberData.weight !== null &&
            !isNaN(memberData.weight)
          ) {
            updates.bodyWeight = memberData.weight;
          }

          return { ...prev, ...updates };
        });
      } catch (error) {
        console.error("회원 정보 조회 실패:", error);
      }
    };

    fetchMember();
  }, [memberId]);

  // 기본 정보의 체중이 변경되면 체성분의 체중에 자동으로 채우기
  useEffect(() => {
    if (
      formData.bodyWeight !== undefined &&
      formData.bodyWeight !== null &&
      !isNaN(formData.bodyWeight)
    ) {
      setFormData((prev) => ({
        ...prev,
        bodyWeightInput: formData.bodyWeight,
      }));
    }
  }, [formData.bodyWeight]);

  // 골격근량과 체지방량이 입력되면 체지방률 자동 계산
  useEffect(() => {
    if (
      formData.bodyWeightInput !== undefined &&
      formData.bodyWeightInput !== null &&
      !isNaN(formData.bodyWeightInput) &&
      formData.bodyWeightInput > 0 &&
      formData.fatMass !== undefined &&
      formData.fatMass !== null &&
      !isNaN(formData.fatMass) &&
      formData.fatMass >= 0
    ) {
      const bodyFatPercentage =
        (formData.fatMass / formData.bodyWeightInput) * 100;
      setFormData((prev) => ({
        ...prev,
        bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
      }));
    }
  }, [formData.bodyWeightInput, formData.fatMass]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.assessedAt) {
      newErrors.assessedAt = "평가일을 선택해주세요.";
    }

    // 모든 항목은 선택 사항이므로 검증하지 않음
    // 단, 입력된 항목에 대해서만 일관성 검증

    // 하체 근력: 입력된 경우에만 검증
    if (
      formData.strengthGrade &&
      formData.strengthGrade === "D" &&
      (!formData.strengthAlternative ||
        (formData.strengthAlternative !== "D-1" &&
          formData.strengthAlternative !== "D-2"))
    ) {
      newErrors.strengthAlternative = "대체 항목을 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("입력한 정보를 확인해주세요.", "error");
      return;
    }

    let requestData: CreateAssessmentRequest | null = null;

    try {
      setIsSubmitting(true);

      // 요청 데이터 구성
      const items: CreateAssessmentRequest["items"] = [];

      // 1. 하체 근력
      if (
        formData.strengthGrade === "D" &&
        formData.strengthAlternative &&
        (formData.strengthAlternative === "D-1" ||
          formData.strengthAlternative === "D-2")
      ) {
        // 대체 항목
        items.push({
          category: "STRENGTH",
          name:
            formData.strengthAlternative === "D-1"
              ? "박스 스쿼트"
              : "고블릿 스쿼트",
          details: {
            grade: formData.strengthAlternative,
          },
        });
      } else if (
        formData.strengthGrade &&
        formData.strengthGrade !== "D" &&
        (formData.strengthGrade === "A" ||
          formData.strengthGrade === "B" ||
          formData.strengthGrade === "C")
      ) {
        items.push({
          category: "STRENGTH",
          name: "체중 스쿼트",
          details: {
            grade: formData.strengthGrade,
          },
        });
      }

      // 2. 심폐 지구력
      if (
        formData.cardioGrade &&
        (formData.cardioGrade === "A" ||
          formData.cardioGrade === "B" ||
          formData.cardioGrade === "C")
      ) {
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
      }

      // 3. 근지구력
      if (
        formData.enduranceGrade &&
        (formData.enduranceGrade === "A" ||
          formData.enduranceGrade === "B" ||
          formData.enduranceGrade === "C")
      ) {
        items.push({
          category: "ENDURANCE",
          name: "플랭크",
          details: {
            grade: formData.enduranceGrade,
          },
        });
      }

      // 4. 유연성
      const flexibilityItemsEntries = Object.entries(
        formData.flexibilityItems || {}
      ).filter(
        ([_, value]) =>
          value && (value === "A" || value === "B" || value === "C")
      );

      if (flexibilityItemsEntries.length > 0) {
        const flexibilityItemsObj: Record<string, string> = {};
        flexibilityItemsEntries.forEach(([key, value]) => {
          if (value) {
            flexibilityItemsObj[key] = value;
          }
        });

        items.push({
          category: "FLEXIBILITY",
          name: "유연성 평가",
          details: {
            flexibilityItems: flexibilityItemsObj,
          },
        });
      }

      // 5. 체성분
      // muscleMass와 bodyFatPercentage만 있으면 추가 (fatMass는 선택)
      if (formData.muscleMass && formData.bodyFatPercentage) {
        items.push({
          category: "BODY",
          name: "인바디",
          value: formData.bodyWeightInput || formData.bodyWeight,
          unit: "kg",
          details: {
            muscleMass: formData.muscleMass,
            ...(formData.fatMass && { fatMass: formData.fatMass }), // fatMass는 선택 사항
            bodyFatPercentage: formData.bodyFatPercentage,
          },
        });
      }

      // 6. 안정성
      if (
        formData.ohsa &&
        (formData.ohsa === "A" ||
          formData.ohsa === "B" ||
          formData.ohsa === "C") &&
        formData.pain &&
        (formData.pain === "none" || formData.pain === "present")
      ) {
        items.push({
          category: "STABILITY",
          name: "OHSA",
          details: {
            ohsa: formData.ohsa,
            pain: formData.pain,
          },
        });
      }

      // items 배열 정리: details에서 undefined 값 제거
      const cleanedItems = items.map((item) => {
        const cleanedItem = { ...item };

        if (cleanedItem.details) {
          const cleanedDetails: any = {};
          Object.keys(cleanedItem.details).forEach((key) => {
            const value = (cleanedItem.details as any)[key];
            if (value !== undefined && value !== null && value !== "") {
              cleanedDetails[key] = value;
            }
          });

          if (Object.keys(cleanedDetails).length > 0) {
            cleanedItem.details = cleanedDetails;
          } else {
            delete cleanedItem.details;
          }
        }

        return cleanedItem;
      });

      // 요청 데이터 구성: undefined 값 제외
      requestData = {
        assessmentType: "INITIAL",
        assessedAt: formData.assessedAt,
        ...(formData.bodyWeight !== undefined &&
          formData.bodyWeight !== null &&
          !isNaN(formData.bodyWeight) && { bodyWeight: formData.bodyWeight }),
        ...(formData.condition && { condition: formData.condition }),
        ...(formData.trainerComment?.trim() && {
          trainerComment: formData.trainerComment.trim(),
        }),
        items: cleanedItems, // 모든 항목 포함 (유연성 포함)
      };

      // 디버깅: 전송되는 데이터 확인
      if (process.env.NODE_ENV === "development") {
        console.log("[Assessment New] 전송할 평가 데이터:", requestData);
      }

      await assessmentApi.createAssessment(memberId, requestData);

      // 초기 평가에서 입력한 키와 몸무게를 회원 정보에 업데이트
      const updateData: { height?: number; weight?: number } = {};

      if (
        formData.height !== undefined &&
        formData.height !== null &&
        !isNaN(formData.height)
      ) {
        updateData.height = formData.height;
      }

      if (
        formData.bodyWeight !== undefined &&
        formData.bodyWeight !== null &&
        !isNaN(formData.bodyWeight)
      ) {
        updateData.weight = formData.bodyWeight;
      }

      // 키나 몸무게가 입력된 경우에만 회원 정보 업데이트
      if (Object.keys(updateData).length > 0) {
        try {
          await memberApi.updateMember(memberId, updateData);
          if (process.env.NODE_ENV === "development") {
            console.log(
              "[Assessment New] 회원 정보 업데이트 완료:",
              updateData
            );
          }
        } catch (error) {
          console.error("회원 정보 업데이트 실패:", error);
          // 회원 정보 업데이트 실패해도 평가는 성공했으므로 계속 진행
        }
      }

      showToast("초기 평가가 생성되었습니다.", "success");
      router.push(`/dashboard/members/${memberId}`);
    } catch (error: any) {
      console.error("평가 생성 실패:", error);

      // 에러 메시지 추출
      const errorMessage =
        error?.message || error?.error?.message || "평가 생성에 실패했습니다.";

      // 개발 환경에서 상세 에러 로그
      if (process.env.NODE_ENV === "development") {
        console.error("[Assessment New] 에러 상세:", {
          error,
          errorMessage,
          requestData: requestData || "요청 데이터 구성 전 에러 발생",
        });
      }

      showToast(errorMessage, "error");
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
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 min-h-screen overflow-hidden">
      {/* 애니메이션 배경 그라데이션 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#0a0d12] to-[#0f1115]"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative">
        {/* 헤더 */}
        <div className="relative mb-6">
          <div className="relative group">
            {/* 애니메이션 그라데이션 바 */}
            <div className="absolute -left-3 top-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
            <div className="absolute -left-3 top-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50 blur-sm"></div>

            <Link
              href={`/dashboard/members/${memberId}`}
              className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block pl-4 transition-colors"
            >
              ← 회원 상세로 돌아가기
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent pl-4 drop-shadow-lg">
              {member ? `${member.name}님 초기 평가 생성` : "초기 평가 생성"}
            </h1>
            <p className="text-[#9ca3af] mt-2 pl-4">
              회원의 초기 평가를 진행합니다. 모든 항목을 입력해주세요.
            </p>
          </div>
        </div>

        {/* 회원 정보 */}
        {member && (
          <Card className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-xl shadow-black/20 backdrop-blur-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-[#9ca3af]">
                  이름
                </label>
                <p className="mt-1 text-[#e5e7eb]">{member.name}</p>
              </div>
              {member.birthDate && (
                <div>
                  <label className="text-sm font-medium text-[#9ca3af]">
                    생년월일
                  </label>
                  <p className="mt-1 text-[#e5e7eb]">
                    {new Date(member.birthDate).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              )}
              {member.height !== undefined && member.height !== null && (
                <div>
                  <label className="text-sm font-medium text-[#9ca3af]">
                    키
                  </label>
                  <p className="mt-1 text-[#e5e7eb]">{member.height} cm</p>
                </div>
              )}
              {member.weight !== undefined && member.weight !== null && (
                <div>
                  <label className="text-sm font-medium text-[#9ca3af]">
                    몸무게
                  </label>
                  <p className="mt-1 text-[#e5e7eb]">{member.weight} kg</p>
                </div>
              )}
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card
            title="기본 정보"
            className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-xl shadow-black/20 backdrop-blur-sm"
          >
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
                  label="키 (cm)"
                  value={formData.height || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  step="0.1"
                />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input
                  label="트레이너 코멘트"
                  value={formData.trainerComment || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, trainerComment: e.target.value })
                  }
                  placeholder="평가 시 관찰한 내용을 기록해주세요."
                />
              </div>
            </div>
          </Card>

          {/* 1. 하체 근력 */}
          <Card
            title="1. 하체 근력"
            className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-xl shadow-black/20 backdrop-blur-sm"
          >
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
                  <p className="mt-1 text-sm text-red-400">
                    {errors.strengthGrade}
                  </p>
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
          <Card
            title="2. 심폐 지구력"
            className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-xl shadow-black/20 backdrop-blur-sm"
          >
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
                      recoverySpeed:
                        value !== "B" ? [] : formData.recoverySpeed,
                    })
                  }
                >
                  <Radio value="A" label="리듬 유지 + 완주" />
                  <Radio value="B" label="리듬 유지" />
                  <Radio value="C" label="조기 중단 / 리듬 붕괴" />
                </RadioGroup>
                {errors.cardioGrade && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.cardioGrade}
                  </p>
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
          <Card
            title="3. 근지구력"
            className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-xl shadow-black/20 backdrop-blur-sm"
          >
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
          <Card
            title="4. 유연성"
            className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-xl shadow-black/20 backdrop-blur-sm"
          >
            <div className="space-y-4">
              <p className="text-sm text-[#9ca3af] mb-4">
                최소 1개 항목 이상 선택해주세요.{" "}
                <span className="text-red-400">*</span>
              </p>
              {errors.flexibility && (
                <p className="text-sm text-red-400 mb-2">
                  {errors.flexibility}
                </p>
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
          <Card
            title="5. 체성분"
            className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-xl shadow-black/20 backdrop-blur-sm"
          >
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
          <Card
            title="6. 안정성"
            className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-xl shadow-black/20 backdrop-blur-sm"
          >
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
    </div>
  );
}
