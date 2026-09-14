export type UserRole = "student" | "teacher";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

export const roleLabels: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
};

export function isTeacher(role: UserRole): boolean {
  return role === "teacher";
}

export function isStudent(role: UserRole): boolean {
  return role === "student";
}
