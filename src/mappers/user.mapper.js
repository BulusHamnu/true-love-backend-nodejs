/* User Profile Mapper */
export function mapUserToResponse(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    age: user.age,
    isVerified: user.isVerified,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    role: user.role,
    provider: user.provider,
  };
}
