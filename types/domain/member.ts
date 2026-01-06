// 회원 도메인 타입
export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}
