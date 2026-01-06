"use client";

import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { CreateMemberRequest } from "@/types/api/requests";
import type { Member } from "@/types/api/responses";

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: CreateMemberRequest) => void | Promise<void>;
  onCancel?: () => void;
}

export default function MemberForm({
  member,
  onSubmit,
  onCancel,
}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMemberRequest>({
    defaultValues: member
      ? {
          name: member.name,
          email: member.email,
          phone: member.phone,
          joinDate: member.joinDate.split("T")[0],
        }
      : {
          joinDate: new Date().toISOString().split("T")[0],
        },
  });

  return (
    <Card title={member ? "회원 정보 수정" : "회원 등록"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Input
          label="전화번호"
          {...register("phone", {
            required: "전화번호를 입력해주세요",
            pattern: {
              value: /^[0-9-]+$/,
              message: "올바른 전화번호 형식이 아닙니다",
            },
          })}
          error={errors.phone?.message}
        />
        <Input
          label="가입일"
          type="date"
          {...register("joinDate", { required: "가입일을 선택해주세요" })}
          error={errors.joinDate?.message}
        />
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit" variant="primary">
            {member ? "수정" : "등록"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
