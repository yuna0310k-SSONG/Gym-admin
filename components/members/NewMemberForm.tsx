"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Radio from "@/components/ui/Radio";
import RadioGroup from "@/components/ui/RadioGroup";
import Checkbox from "@/components/ui/Checkbox";
import type {
  CreateMemberRequest,
  CreateAssessmentRequest,
  CreateInjuryRequest,
} from "@/types/api/requests";
import { onlyDigits, formatPhoneNumberKR } from "@/lib/utils/phone";

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

interface NewMemberFormData extends CreateMemberRequest {
  initialAssessment?: AssessmentFormData & {
    items?: CreateAssessmentRequest["items"];
  };
  injuries?: CreateInjuryRequest[];
}

interface NewMemberFormProps {
  onSubmit: (data: NewMemberFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export default function NewMemberForm({
  onSubmit,
  onCancel,
}: NewMemberFormProps) {
  const [showAssessment, setShowAssessment] = useState(false);
  const [showInjuries, setShowInjuries] = useState(false);
  const [assessmentErrors, setAssessmentErrors] = useState<
    Record<string, string>
  >({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NewMemberFormData>({
    defaultValues: {
      joinDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      initialAssessment: {
        assessedAt: new Date().toISOString().split("T")[0],
        strengthGrade: "",
        strengthAlternative: "",
        cardioGrade: "",
        recoverySpeed: [],
        enduranceGrade: "",
        flexibilityItems: {},
        bodyWeightInput: undefined,
        muscleMass: undefined,
        fatMass: undefined,
        bodyFatPercentage: undefined,
        ohsa: "",
        pain: "",
      },
      injuries: [],
    },
  });

  const {
    fields: injuryFields,
    append: appendInjury,
    remove: removeInjury,
  } = useFieldArray({
    control,
    name: "injuries",
  });

  const assessmentData = watch("initialAssessment");

  const handleRecoverySpeedChange = (value: string, checked: boolean) => {
    const currentSpeed = assessmentData?.recoverySpeed || [];
    const newSpeed = checked
      ? [...currentSpeed, value]
      : currentSpeed.filter((v) => v !== value);
    setValue("initialAssessment.recoverySpeed", newSpeed);
  };

  const validateAssessment = (): boolean => {
    if (!assessmentData) return true; // 선택 사항이므로 비어있으면 통과

    const newErrors: Record<string, string> = {};

    if (!assessmentData.assessedAt) {
      newErrors.assessedAt = "평가일을 선택해주세요.";
    }

    // 하체 근력 검증
    if (!assessmentData.strengthGrade) {
      newErrors.strengthGrade = "하체 근력 평가를 선택해주세요.";
    } else if (
      assessmentData.strengthGrade === "D" &&
      !assessmentData.strengthAlternative
    ) {
      newErrors.strengthAlternative = "대체 항목을 선택해주세요.";
    }

    // 심폐 지구력 검증
    if (!assessmentData.cardioGrade) {
      newErrors.cardioGrade = "심폐 지구력 평가를 선택해주세요.";
    }

    // 근지구력 검증
    if (!assessmentData.enduranceGrade) {
      newErrors.enduranceGrade = "근지구력 평가를 선택해주세요.";
    }

    // 유연성 검증 (최소 1개 항목)
    const flexibilityCount = Object.values(
      assessmentData.flexibilityItems || {}
    ).filter((v) => v !== "" && v !== undefined).length;
    if (flexibilityCount === 0) {
      newErrors.flexibility =
        "유연성 평가 항목을 최소 1개 이상 선택해주세요.";
    }

    // 체성분 검증
    if (
      !assessmentData.muscleMass ||
      !assessmentData.fatMass ||
      !assessmentData.bodyFatPercentage
    ) {
      newErrors.bodyComposition = "체성분 데이터를 모두 입력해주세요.";
    }

    // 안정성 검증
    if (!assessmentData.ohsa) {
      newErrors.ohsa = "OHSA 평가를 선택해주세요.";
    }
    if (!assessmentData.pain) {
      newErrors.pain = "통증 체크를 선택해주세요.";
    }

    setAssessmentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertAssessmentToItems = (
    data: AssessmentFormData
  ): CreateAssessmentRequest["items"] => {
    const items: CreateAssessmentRequest["items"] = [];

    // 1. 하체 근력
    if (data.strengthGrade === "D" && data.strengthAlternative) {
      items.push({
        category: "STRENGTH",
        name: data.strengthAlternative === "D-1" ? "박스 스쿼트" : "고블릿 스쿼트",
        details: {
          grade: data.strengthAlternative,
        },
      });
    } else if (data.strengthGrade !== "D" && data.strengthGrade) {
      items.push({
        category: "STRENGTH",
        name: "체중 스쿼트",
        details: {
          grade: data.strengthGrade,
        },
      });
    }

    // 2. 심폐 지구력
    if (data.cardioGrade) {
      items.push({
        category: "CARDIO",
        name: "스텝 테스트",
        details: {
          grade: data.cardioGrade,
          recoverySpeed:
            data.cardioGrade === "B" && data.recoverySpeed.length > 0
              ? data.recoverySpeed
              : undefined,
        },
      });
    }

    // 3. 근지구력
    if (data.enduranceGrade) {
      items.push({
        category: "ENDURANCE",
        name: "플랭크",
        details: {
          grade: data.enduranceGrade,
        },
      });
    }

    // 4. 유연성
    const flexibilityItems = Object.entries(data.flexibilityItems || {})
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
    if (
      data.muscleMass &&
      data.fatMass &&
      data.bodyFatPercentage !== undefined
    ) {
      items.push({
        category: "BODY",
        name: "인바디",
        value: data.bodyWeightInput || data.bodyWeight,
        unit: "kg",
        details: {
          muscleMass: data.muscleMass,
          fatMass: data.fatMass,
          bodyFatPercentage: data.bodyFatPercentage,
        },
      });
    }

    // 6. 안정성
    if (data.ohsa && data.pain) {
      items.push({
        category: "STABILITY",
        name: "OHSA",
        details: {
          ohsa: data.ohsa,
          pain: data.pain,
        },
      });
    }

    return items;
  };

  const onFormSubmit = async (data: NewMemberFormData) => {
    // 초기 평가가 활성화되어 있으면 검증
    if (showAssessment && data.initialAssessment) {
      if (!validateAssessment()) {
        return;
      }

      // assessment 데이터를 items 형식으로 변환
      const items = convertAssessmentToItems(data.initialAssessment);
      data.initialAssessment = {
        ...data.initialAssessment,
        items: items as any,
      } as any;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <Card title="기본 정보" className="bg-[#0f1115]">
        <div className="space-y-4">
          <Input
            label="이름"
            {...register("name", { required: "이름을 입력해주세요" })}
            error={errors.name?.message}
          />
          <Input
            label="이메일"
            type="email"
            {...register("email", {
              required: "이메일을 입력해주세요",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "올바른 이메일 형식이 아닙니다",
              },
            })}
            error={errors.email?.message}
          />
          {(() => {
            const phoneField = register("phone", {
              required: "전화번호를 입력해주세요",
              validate: (value) => {
                const digits = onlyDigits(String(value ?? ""));
                if (digits.length === 0) return "전화번호를 입력해주세요";
                if (digits.length !== 10 && digits.length !== 11) {
                  return "전화번호는 10~11자리로 입력해주세요";
                }
                return true;
              },
              setValueAs: (value) => {
                // 저장 시 숫자만 저장
                return onlyDigits(String(value ?? ""));
              },
            });

            return (
              <div className="space-y-1">
                <Input
                  label="전화번호"
                  type="tel"
                  inputMode="numeric"
                  placeholder="010-1234-5678"
                  maxLength={13}
                  {...phoneField}
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value).slice(0, 11);
                    // 입력 중에는 하이픈이 포함된 형식으로 표시
                    const formatted = formatPhoneNumberKR(digits);
                    e.target.value = formatted;
                    // react-hook-form에는 숫자만 전달
                    phoneField.onChange({
                      ...e,
                      target: { ...e.target, value: digits },
                    });
                  }}
                  error={errors.phone?.message}
                />
                <p className="text-xs text-[#9ca3af]">
                  하이픈(-) 없이 숫자만 입력해주세요!
                </p>
              </div>
            );
          })()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="생년월일"
              type="date"
              {...register("birthDate")}
              error={errors.birthDate?.message}
            />
            <Input
              label="가입일"
              type="date"
              {...register("joinDate", { required: "가입일을 선택해주세요" })}
              error={errors.joinDate?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
              상태
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="ACTIVE"
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
              <option value="SUSPENDED">정지</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 신체 정보 */}
      <Card title="신체 정보" className="bg-[#0f1115]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="키 (cm)"
              type="number"
              step="0.1"
              placeholder="예: 175.5"
              {...register("height", {
                valueAsNumber: true,
                min: { value: 50, message: "키는 50cm 이상이어야 합니다." },
                max: { value: 250, message: "키는 250cm 이하여야 합니다." },
              })}
              error={errors.height?.message}
            />
            <Input
              label="몸무게 (kg)"
              type="number"
              step="0.1"
              placeholder="예: 70.5"
              {...register("weight", {
                valueAsNumber: true,
                min: { value: 20, message: "몸무게는 20kg 이상이어야 합니다." },
                max: { value: 300, message: "몸무게는 300kg 이하여야 합니다." },
              })}
              error={errors.weight?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
              성별
            </label>
            <select
              {...register("gender")}
              className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택 안함</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-400">{errors.gender.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* 초기 평가 */}
      <Card title="초기 평가 (능력치)" className="bg-[#0f1115]">
        {!showAssessment ? (
          <div className="text-center py-4">
            <p className="text-[#c9c7c7] mb-4">
              초기 평가 데이터를 입력하시겠습니까?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAssessment(true)}
            >
              초기 평가 추가
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <Input
                type="date"
                label="평가일"
                {...register("initialAssessment.assessedAt", {
                  required: "평가일을 선택해주세요",
                })}
                error={
                  errors.initialAssessment?.assessedAt?.message ||
                  assessmentErrors.assessedAt
                }
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="체중 (kg)"
                  step="0.1"
                  {...register("initialAssessment.bodyWeight", {
                    valueAsNumber: true,
                  })}
                />

                <div>
                  <label className="block text-sm font-medium text-[#c9c7c7] mb-1">
                    컨디션
                  </label>
                  <select
                    {...register("initialAssessment.condition")}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {...register("initialAssessment.trainerComment")}
                placeholder="평가 시 관찰한 내용을 기록해주세요."
              />
            </div>

            {/* 1. 하체 근력 */}
            <div className="border-t border-[#374151] pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                1. 하체 근력
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                    체중 스쿼트 수행 상태 <span className="text-red-400">*</span>
                  </label>
                  <RadioGroup
                    name="strengthGrade"
                    value={assessmentData?.strengthGrade || ""}
                    onChange={(value) => {
                      setValue("initialAssessment.strengthGrade", value as any);
                      if (value !== "D") {
                        setValue("initialAssessment.strengthAlternative", "");
                      }
                    }}
                  >
                    <Radio value="A" label="안정적으로 반복 수행" />
                    <Radio
                      value="B"
                      label="수행 가능, 깊이·정렬 일부 제한"
                    />
                    <Radio value="C" label="수행 가능하나 불안정 / 연속 어려움" />
                    <Radio value="D" label="수행 불가 → 대체 항목" />
                  </RadioGroup>
                  {assessmentErrors.strengthGrade && (
                    <p className="mt-1 text-sm text-red-400">
                      {assessmentErrors.strengthGrade}
                    </p>
                  )}
                </div>

                {assessmentData?.strengthGrade === "D" && (
                  <div>
                    <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                      대체 항목 <span className="text-red-400">*</span>
                    </label>
                    <RadioGroup
                      name="strengthAlternative"
                      value={assessmentData?.strengthAlternative || ""}
                      onChange={(value) =>
                        setValue(
                          "initialAssessment.strengthAlternative",
                          value as any
                        )
                      }
                    >
                      <Radio value="D-1" label="체어/박스 스쿼트 가능" />
                      <Radio value="D-2" label="보조 있어도 어려움" />
                    </RadioGroup>
                    {assessmentErrors.strengthAlternative && (
                      <p className="mt-1 text-sm text-red-400">
                        {assessmentErrors.strengthAlternative}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. 심폐 지구력 */}
            <div className="border-t border-[#374151] pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                2. 심폐 지구력
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                    스텝 테스트 수행 상태 <span className="text-red-400">*</span>
                  </label>
                  <RadioGroup
                    name="cardioGrade"
                    value={assessmentData?.cardioGrade || ""}
                    onChange={(value) => {
                      setValue("initialAssessment.cardioGrade", value as any);
                      if (value !== "B") {
                        setValue("initialAssessment.recoverySpeed", []);
                      }
                    }}
                  >
                    <Radio value="A" label="리듬 유지 + 완주" />
                    <Radio value="B" label="리듬 유지" />
                    <Radio value="C" label="조기 중단 / 리듬 붕괴" />
                  </RadioGroup>
                  {assessmentErrors.cardioGrade && (
                    <p className="mt-1 text-sm text-red-400">
                      {assessmentErrors.cardioGrade}
                    </p>
                  )}
                </div>

                {assessmentData?.cardioGrade === "B" && (
                  <div>
                    <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                      회복 속도 (선택)
                    </label>
                    <div className="space-y-2">
                      <Checkbox
                        label="회복 빠름 (1분 이내 호흡 편안)"
                        checked={assessmentData?.recoverySpeed?.includes(
                          "fast"
                        ) || false}
                        onChange={(e) =>
                          handleRecoverySpeedChange("fast", e.target.checked)
                        }
                      />
                      <Checkbox
                        label="회복 느림 (2분 이상 호흡 불편)"
                        checked={assessmentData?.recoverySpeed?.includes(
                          "slow"
                        ) || false}
                        onChange={(e) =>
                          handleRecoverySpeedChange("slow", e.target.checked)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. 근지구력 */}
            <div className="border-t border-[#374151] pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                3. 근지구력
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                    플랭크 수행 상태 <span className="text-red-400">*</span>
                  </label>
                  <RadioGroup
                    name="enduranceGrade"
                    value={assessmentData?.enduranceGrade || ""}
                    onChange={(value) =>
                      setValue("initialAssessment.enduranceGrade", value as any)
                    }
                  >
                    <Radio value="A" label="자세 안정, 흔들림 거의 없음" />
                    <Radio value="B" label="유지 가능하나 흔들림 있음" />
                    <Radio value="C" label="빠른 붕괴 / 중단" />
                  </RadioGroup>
                  {assessmentErrors.enduranceGrade && (
                    <p className="mt-1 text-sm text-red-400">
                      {assessmentErrors.enduranceGrade}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. 유연성 */}
            <div className="border-t border-[#374151] pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                4. 유연성
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-[#9ca3af] mb-4">
                  최소 1개 항목 이상 선택해주세요.{" "}
                  <span className="text-red-400">*</span>
                </p>
                {assessmentErrors.flexibility && (
                  <p className="text-sm text-red-400 mb-2">
                    {assessmentErrors.flexibility}
                  </p>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                    좌전굴
                  </label>
                  <RadioGroup
                    name="sitAndReach"
                    value={
                      assessmentData?.flexibilityItems?.sitAndReach || ""
                    }
                    onChange={(value) => {
                      const currentItems =
                        assessmentData?.flexibilityItems || {};
                      setValue("initialAssessment.flexibilityItems", {
                        ...currentItems,
                        sitAndReach: value as any,
                      });
                    }}
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
                    value={assessmentData?.flexibilityItems?.shoulder || ""}
                    onChange={(value) => {
                      const currentItems =
                        assessmentData?.flexibilityItems || {};
                      setValue("initialAssessment.flexibilityItems", {
                        ...currentItems,
                        shoulder: value as any,
                      });
                    }}
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
                    value={assessmentData?.flexibilityItems?.hip || ""}
                    onChange={(value) => {
                      const currentItems =
                        assessmentData?.flexibilityItems || {};
                      setValue("initialAssessment.flexibilityItems", {
                        ...currentItems,
                        hip: value as any,
                      });
                    }}
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
                    value={assessmentData?.flexibilityItems?.hamstring || ""}
                    onChange={(value) => {
                      const currentItems =
                        assessmentData?.flexibilityItems || {};
                      setValue("initialAssessment.flexibilityItems", {
                        ...currentItems,
                        hamstring: value as any,
                      });
                    }}
                  >
                    <Radio value="A" label="제한 없음" />
                    <Radio value="B" label="일부 제한" />
                    <Radio value="C" label="명확한 제한" />
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* 5. 체성분 */}
            <div className="border-t border-[#374151] pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                5. 체성분
              </h3>
              <div className="space-y-4">
                {assessmentErrors.bodyComposition && (
                  <p className="text-sm text-red-400">
                    {assessmentErrors.bodyComposition}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="체중 (kg)"
                    step="0.1"
                    {...register("initialAssessment.bodyWeightInput", {
                      valueAsNumber: true,
                    })}
                    required
                  />
                  <Input
                    type="number"
                    label="골격근량 (kg)"
                    step="0.1"
                    {...register("initialAssessment.muscleMass", {
                      valueAsNumber: true,
                    })}
                    required
                  />
                  <Input
                    type="number"
                    label="체지방량 (kg)"
                    step="0.1"
                    {...register("initialAssessment.fatMass", {
                      valueAsNumber: true,
                    })}
                    required
                  />
                  <Input
                    type="number"
                    label="체지방률 (%)"
                    step="0.1"
                    {...register("initialAssessment.bodyFatPercentage", {
                      valueAsNumber: true,
                    })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 6. 안정성 */}
            <div className="border-t border-[#374151] pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                6. 안정성
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                    OHSA 종합 <span className="text-red-400">*</span>
                  </label>
                  <RadioGroup
                    name="ohsa"
                    value={assessmentData?.ohsa || ""}
                    onChange={(value) =>
                      setValue("initialAssessment.ohsa", value as any)
                    }
                  >
                    <Radio value="A" label="보상 거의 없음" />
                    <Radio value="B" label="경미한 보상" />
                    <Radio value="C" label="명확한 보상" />
                  </RadioGroup>
                  {assessmentErrors.ohsa && (
                    <p className="mt-1 text-sm text-red-400">
                      {assessmentErrors.ohsa}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                    통증 체크 <span className="text-red-400">*</span>
                  </label>
                  <RadioGroup
                    name="pain"
                    value={assessmentData?.pain || ""}
                    onChange={(value) =>
                      setValue("initialAssessment.pain", value as any)
                    }
                  >
                    <Radio value="none" label="없음" />
                    <Radio value="present" label="있음" />
                  </RadioGroup>
                  {assessmentErrors.pain && (
                    <p className="mt-1 text-sm text-red-400">
                      {assessmentErrors.pain}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[#374151] pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssessment(false)}
              >
                초기 평가 제거
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 부상 이력 */}
      <Card title="부상 이력" className="bg-[#0f1115]">
        {!showInjuries ? (
          <div className="text-center py-4">
            <p className="text-[#c9c7c7] mb-4">부상 이력을 입력하시겠습니까?</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                appendInjury({
                  injuryType: "",
                  bodyPart: "",
                  date: new Date().toISOString().split("T")[0],
                  severity: "MILD",
                  recoveryStatus: "RECOVERING",
                });
                setShowInjuries(true);
              }}
            >
              부상 이력 추가
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {injuryFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-[#1a1d24] rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input
                    label="부상 유형"
                    {...register(`injuries.${index}.injuryType`, {
                      required: "부상 유형을 입력해주세요",
                    })}
                    error={errors.injuries?.[index]?.injuryType?.message}
                  />
                  <Input
                    label="부상 부위"
                    {...register(`injuries.${index}.bodyPart`, {
                      required: "부상 부위를 입력해주세요",
                    })}
                    error={errors.injuries?.[index]?.bodyPart?.message}
                  />
                  <Input
                    label="부상 날짜"
                    type="date"
                    {...register(`injuries.${index}.date`, {
                      required: "부상 날짜를 선택해주세요",
                    })}
                    error={errors.injuries?.[index]?.date?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                      심각도
                    </label>
                    <select
                      {...register(`injuries.${index}.severity`)}
                      className="w-full px-3 py-2 bg-[#0f1115] border border-gray-700 rounded-md text-white"
                    >
                      <option value="MILD">경미</option>
                      <option value="MODERATE">보통</option>
                      <option value="SEVERE">심각</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                      회복 상태
                    </label>
                    <select
                      {...register(`injuries.${index}.recoveryStatus`)}
                      className="w-full px-3 py-2 bg-[#0f1115] border border-gray-700 rounded-md text-white"
                    >
                      <option value="RECOVERED">회복됨</option>
                      <option value="RECOVERING">회복 중</option>
                      <option value="CHRONIC">만성</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                    설명
                  </label>
                  <textarea
                    {...register(`injuries.${index}.description`)}
                    rows={2}
                    className="w-full px-3 py-2 bg-[#0f1115] border border-gray-700 rounded-md text-white"
                    placeholder="부상에 대한 상세 설명"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeInjury(index)}
                >
                  제거
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendInjury({
                  injuryType: "",
                  bodyPart: "",
                  date: new Date().toISOString().split("T")[0],
                  severity: "MILD",
                  recoveryStatus: "RECOVERING",
                })
              }
            >
              부상 이력 추가
            </Button>
          </div>
        )}
      </Card>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" variant="primary">
          등록
        </Button>
      </div>
    </form>
  );
}
