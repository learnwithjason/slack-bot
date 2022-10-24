export const accountStatus = {
  TRIAL: "Trial",
  TRIAL_ENDED: "Trial Ended",
  BASIC: "Active",
  ONBOARDING: "Onboarding",
  CANCELLED: "Cancelled",
};

export const goalStates = {
  PROGRESS: "In Progress",
  COMPLETE: "Completed",
};

export const categories = [
  { value: "personal", title: "Personal" },
  { value: "work", title: "Work" },
  { value: "fitness", title: "Health and Fitness" },
  { value: "family", title: "Family" },
  {
    value: "awardsAchievements",
    title: "Awards or Achievements",
  },
];

export const getCategoryName = (categoryValue) => {
  let category = categories.find((c) => c.value === categoryValue);
  return category ? category.title : "Category not found";
};

export const getCategoryColor = (categoryValue) => {
  let category = categories.find((c) => c.value === categoryValue);
  return category ? category.color : colors.PURPLE;
};

export const getCategoriesForSlack = () => {
  const categoryOptions = categories.map((category) => {
    return {
      text: {
        type: "plain_text",
        text: category.title,
        emoji: true,
      },
      value: category.title,
    };
  });

  console.log(`categoryOptions: ${JSON.stringify(categoryOptions)}`);

  return categoryOptions;
};
