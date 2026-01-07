"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type {
  CreateMemberRequest,
  CreateAssessmentRequest,
  CreateInjuryRequest,
} from "@/types/api/requests";
import { onlyDigits, formatPhoneNumberKR } from "@/lib/utils/phone";

interface NewMemberFormData extends CreateMemberRequest {
  initialAssessment?: {
    assessedAt: string;
    bodyWeight?: number;
    condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
    trainerComment?: string;
    items: Array<{
      category:
        | "STRENGTH"
        | "CARDIO"
        | "ENDURANCE"
        | "FLEXIBILITY"
        | "BODY"
        | "STABILITY";
      name: string;
      value: number;
      unit: string;
    }>;
  };
  injuries?: CreateInjuryRequest[];
}

interface NewMemberFormProps {
  onSubmit: (data: NewMemberFormData) => void | Promise<void>;
  onCancel?: () => void;
}

const ASSESSMENT_CATEGORIES = [
  { value: "STRENGTH", label: "근력", indicators: ["하체 근력"] },
  { value: "CARDIO", label: "심폐", indicators: ["심폐 지구력"] },
  { value: "ENDURANCE", label: "지구력", indicators: ["근지구력"] },
  { value: "FLEXIBILITY", label: "유연성", indicators: ["유연성"] },
  { value: "BODY", label: "신체", indicators: ["체성분 밸런스"] },
  { value: "STABILITY", label: "안정성", indicators: ["부상 안정성"] },
] as const;

export default function NewMemberForm({
  onSubmit,
  onCancel,
}: NewMemberFormProps) {
  const [showAssessment, setShowAssessment] = useState(false);
  const [showInjuries, setShowInjuries] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewMemberFormData>({
    defaultValues: {
      joinDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      initialAssessment: {
        assessedAt: new Date().toISOString().split("T")[0],
        items: [],
      },
      injuries: [],
    },
  });

  const {
    fields: assessmentItems,
    append: appendAssessmentItem,
    remove: removeAssessmentItem,
  } = useFieldArray({
    control,
    name: "initialAssessment.items",
  });

  const {
    fields: injuryFields,
    append: appendInjury,
    remove: removeInjury,
  } = useFieldArray({
    control,
    name: "injuries",
  });

  const addDefaultAssessmentItems = () => {
    ASSESSMENT_CATEGORIES.forEach((category) => {
      appendAssessmentItem({
        category: category.value,
        name: category.indicators[0],
        value: 0,
        unit:
          category.value === "STRENGTH"
            ? "kg"
            : category.value === "CARDIO"
            ? "ml/kg/min"
            : "점",
      });
    });
    setShowAssessment(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Input
            label="가입일"
            type="date"
            {...register("joinDate", { required: "가입일을 선택해주세요" })}
            error={errors.joinDate?.message}
          />
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
              onClick={addDefaultAssessmentItems}
            >
              초기 평가 추가
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="평가 날짜"
                type="date"
                {...register("initialAssessment.assessedAt", {
                  required: "평가 날짜를 선택해주세요",
                })}
                error={errors.initialAssessment?.assessedAt?.message}
              />
              <Input
                label="체중 (kg)"
                type="number"
                step="0.1"
                {...register("initialAssessment.bodyWeight", {
                  valueAsNumber: true,
                })}
                error={errors.initialAssessment?.bodyWeight?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                컨디션
              </label>
              <select
                {...register("initialAssessment.condition")}
                className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안함</option>
                <option value="EXCELLENT">우수</option>
                <option value="GOOD">좋음</option>
                <option value="NORMAL">보통</option>
                <option value="POOR">나쁨</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                트레이너 코멘트
              </label>
              <textarea
                {...register("initialAssessment.trainerComment")}
                rows={3}
                className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="평가에 대한 코멘트를 입력해주세요"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                평가 항목
              </h3>
              <div className="space-y-3">
                {assessmentItems.map((item, index) => (
                  <div key={item.id} className="p-4 bg-[#1a1d24] rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#c9c7c7] mb-1">
                          카테고리
                        </label>
                        <select
                          {...register(
                            `initialAssessment.items.${index}.category`
                          )}
                          className="w-full px-3 py-2 bg-[#0f1115] border border-gray-700 rounded-md text-white text-sm"
                        >
                          {ASSESSMENT_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#c9c7c7] mb-1">
                          항목명
                        </label>
                        <Input
                          {...register(
                            `initialAssessment.items.${index}.name`,
                            { required: "항목명을 입력해주세요" }
                          )}
                          error={
                            errors.initialAssessment?.items?.[index]?.name
                              ?.message
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#c9c7c7] mb-1">
                          측정값
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          {...register(
                            `initialAssessment.items.${index}.value`,
                            {
                              required: "측정값을 입력해주세요",
                              valueAsNumber: true,
                            }
                          )}
                          error={
                            errors.initialAssessment?.items?.[index]?.value
                              ?.message
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#c9c7c7] mb-1">
                          단위
                        </label>
                        <Input
                          {...register(
                            `initialAssessment.items.${index}.unit`,
                            { required: "단위를 입력해주세요" }
                          )}
                          error={
                            errors.initialAssessment?.items?.[index]?.unit
                              ?.message
                          }
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeAssessmentItem(index)}
                      className="mt-2"
                    >
                      제거
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendAssessmentItem({
                    category: "STRENGTH",
                    name: "",
                    value: 0,
                    unit: "",
                  })
                }
                className="mt-3"
              >
                평가 항목 추가
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
