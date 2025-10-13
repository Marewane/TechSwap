const transformUserResponse = (user) => {
  // ✅ Only return fields the frontend actually needs
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    skillsToLearn: user.skillsToLearn,
    skillsToTeach: user.skillsToTeach,
    rating: user.rating,
    totalSession: user.totalSession,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin // Only if needed for "Last seen"
  };
};

module.exports = { transformUserResponse };