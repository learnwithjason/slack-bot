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

export const SLACK_ACTIONS = {
  ADD_HYPE: "ADD_HYPE",
  ADD_GOAL: "ADD_GOAL",
  ADD_CHALLENGE: "ADD_CHALLENGE",
  LIST_HYPE: "LIST_HYPE",
  LIST_GOAL: "LIST_GOAL",
  LIST_CHALLENGE: "LIST_CHALLENGE",
  NO_ACTION: "NO_ACTION",
  ACTION_ERROR: "ACTION_ERROR",
};

export const getCategoryName = (categoryValue) => {
  let category = categories.find((c) => c.value === categoryValue);
  return category ? category.title : "Category not found";
};

export const getCategoriesForSlack = () => {
  const categoryOptions = categories.map((category) => {
    return {
      text: {
        type: "plain_text",
        text: category.title,
        emoji: true,
      },
      value: category.value,
    };
  });

  return categoryOptions;
};
