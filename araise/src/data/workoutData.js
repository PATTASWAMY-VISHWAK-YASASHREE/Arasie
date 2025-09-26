// Comprehensive Workout Data Structure
export const workoutData = {
  // Gym Splits
  gym: {
    ppl: {
      name: "Push/Pull/Legs",
      description: "6-day hypertrophy split",
      duration: "6 days/week",
      type: "Hypertrophy",
      days: {
        push: {
          name: "Push Day",
          exercises: [
            {
              id: 1,
              name: "Push-ups",
              uniqueName: "pushups",
              sets: 3,
              reps: "15",
              pose_analyzer: true,
              description: "Bodyweight chest warm-up",
              primaryMuscle: "Chest",
              secondaryMuscles: ["Triceps", "Shoulders", "Core"],
              video: "/videos/chest/pushups.mp4"
            },
            {
              name: "Incline Dumbbell Press",
              id: 2,
              uniqueName: "benchpress",
              sets: 3,
              reps: "15",
              pose_analyzer: true,
              description: "Upper chest hypertrophy focus",
              primaryMuscle: "Upper Chest",
              secondaryMuscles: ["Triceps", "Front Deltoids"],
              video: "/videos/chest/dumbbell_press.mp4"
            },
            {
              id: 3,
              name: "Incline Barbell Bench Press",
              uniqueName: "benchpress",
              sets: 3,
              reps: "15",
              pose_analyzer: true,
              description: "Upper chest hypertrophy focus",
              primaryMuscle: "Upper Chest",
              secondaryMuscles: ["Triceps", "Front Deltoids"],
              video: "/videos/chest/inclined_chest_press.mp4"
            },
            {
              id: 4,
              name: "Flat Barbell Bench Press",
              uniqueName: "benchpress",
              sets: 3,
              reps: "10-12",
              pose_analyzer: true,
              description: "Mid-chest compound strength builder",
              primaryMuscle: "Chest",
              secondaryMuscles: ["Triceps", "Shoulders"],
              video: "/videos/chest/flat_bench_press.mp4"
            },
            {
              id: 5,
              name: "Rope Pulldowns (Chest)",
              uniqueName: "ropepulldown",
              sets: 2,
              reps: "12-15",
              pose_analyzer: true,
              description: "Lower chest isolation",
              primaryMuscle: "Lower Chest",
              secondaryMuscles: ["Triceps"],
              video:"/videos/chest/chest_flys.mp4"
            },
            {
              id: 6,
              name: "Tricep Extension Push-ups",
              uniqueName: "benttricep",
              sets: 1,
              reps: "20",
              pose_analyzer: true,
              description: "Tricep activation warm-up",
              primaryMuscle: "Triceps",
              secondaryMuscles: ["Chest", "Shoulders"],
              video:"/videos/tricep/Tricep_Extension_Push-ups.mp4"
            },
            {
              id: 7,
              name: "Bent Tricep Pull",
              uniqueName: "benttricep",
              sets: 2,
              reps: "10",
              pose_analyzer: true,
              description: "Free-weight tricep isolation",
              primaryMuscle: "Triceps",
              secondaryMuscles: [],
              video:"/videos/tricep/long_head.mp4"
            },
            {
              id: 8,
              name: "Tricep Rope Pulldown",
              uniqueName: "benttricep",
              sets: 2,
              reps: "15",
              pose_analyzer: true,
              description: "Cable-based tricep isolation",
              primaryMuscle: "Triceps",
              secondaryMuscles: ["Forearms"],
              video:"/videos/tricep/tricpe_shape.mp4"
            },
            {
              id: 9,
              name: "Crunches",
              uniqueName: "crunches",
              sets: 3,
              reps: "20",
              pose_analyzer: true,
              description: "Core activation and abdominal hypertrophy",
              primaryMuscle: "Abs",
              secondaryMuscles: ["Obliques"],
              video: "/videos/abs/abs_ropecrunches.mp4"
            },
            {
              id: 10,
              name: "Plank",
              uniqueName: "plank",
              sets: 3,
              reps: "60s hold",
              pose_analyzer: true,
              description: "Core stability and endurance",
              primaryMuscle: "Core",
              secondaryMuscles: ["Shoulders", "Glutes", "Lower Back"],
              video: "/videos/abs/plank.mp4"
            }
          ]
        },
        pull: {
          name: "Pull Day",
          exercises: [
            {
              id: 1,
              name: "Wide Grip Pull-ups",
              uniqueName:"pullup",
              sets: 3,
              reps: "10",
              pose_analyzer: true,
              description: "Lat width development",
              primaryMuscle: "Lats",
              secondaryMuscles: ["Biceps", "Rear Deltoids", "Traps"],
              video: "/videos/back/wide_grip_pull_ups.mp4"
            },
            {
              id: 2,
              name: "Neutral Grip Pull-ups",
              uniqueName:"pullup",
              sets: 3,
              reps: "10",
              pose_analyzer: true,
              description: "Balanced back & arm engagement",
              primaryMuscle: "Lats",
              secondaryMuscles: ["Biceps", "Forearms"],
              video:"/videos/back/Neutral_grip_pull_ups.mp4"
            },
            {
              id: 3,
              name: "Chest Supported Rows",
              uniqueName:"chestsupportedrow",
              sets: 3,
              reps: "10",
              pose_analyzer: true,
              description: "Mid-back and rhomboid activation",
              primaryMuscle: "Middle Back",
              secondaryMuscles: ["Lats", "Biceps", "Rear Deltoids"],
              video:"/videos/back/chest_rows.mp4"
            },
            
              {
                id: 4,
                name: "Cable Lat Pulldown",
                uniqueName:"widegrippulldown",
                sets: 1,
                reps: "15",
                pose_analyzer: true,
                description: "Cable isolation for lats",
                primaryMuscle: "Lats",
                secondaryMuscles: ["Traps", "Rear Deltoids"],
                video:"/videos/back/Lat_pulldown.mp4"
              },
            {
              id: 5,
              name: "Neutral Grip Pulldown",
              uniqueName:"widegrippulldown",
              sets: 1,
              reps: "15",
              pose_analyzer: true,
              description: "Neutral grip for lats & biceps",
              primaryMuscle: "Lats",
              secondaryMuscles: ["Biceps", "Rear Deltoids"],
              video:"/videos/back/nuetralgrip_pulldwon.mp4"
              
            },
            {
              id: 6,
              name: "Horizontal nertual grip",
              uniqueName:"widegrippulldown",
              sets: 2,
              reps: "12",
              pose_analyzer: true,
              description: "Functional unilateral lat movement",
              primaryMuscle: "Lats",
              secondaryMuscles: ["Core", "Biceps"],
               video:"/videos/back/horizontal_nuetralgrip.mp4"
            },
            
            {
              id: 7,
              name: "Reverse Crunches",
              uniqueName: "crunches",
              sets: 2,
              reps: "15",
              pose_analyzer: true,
              description: "Lower abs engagement",
              primaryMuscle: "Lower Abs",
              secondaryMuscles: ["Hip Flexors"],
              video:"/videos/back/Lowerback.mp4"
            },
            {
              id: 8,
              name: "EZ Bar Preacher Curls",
              uniqueName:"biceps",
              sets: 2,
              reps: "15",
              pose_analyzer: true,
              description: "Strict bicep curl variation",
              primaryMuscle: "Biceps",
              secondaryMuscles: ["Forearms"],
              video:"/videos/biceps/EZ_Bar_Preacher_Curls.mp4"
            },
            {
              id: 9,
              name: "Incline Dumbbell Curls",
              uniqueName:"biceps",
              sets: 3,
              reps: "15",
              pose_analyzer: true,
              description: "Bicep peak isolation",
              primaryMuscle: "Biceps",
              secondaryMuscles: ["Forearms"],
              video:"/videos/biceps/inclined_barbell_cruls.mp4"
            },
            {
              id: 10,
              name: "Hammer Curls",
              uniqueName:"biceps",
              sets: 3,
              reps: "15",
              pose_analyzer: true,
              description: "Biceps & brachialis thickness",
              primaryMuscle: "Biceps",
              secondaryMuscles: ["Forearms"],
              video:"/videos/biceps/hammercurls.mp4"
            }
          ]
        },
        legs: {
          name: "Leg Day",
          exercises: [
            {
              id: 1,
              name: "Squats",
              sets: 3,
              uniqueName: "squats",
              reps: "12-15",
              pose_analyzer: true,
              description: "Compound lower body builder",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Core"],
              video:"/videos/legs/Squats.mp4"
            },
            {
              id: 2,
              name: "Leg Press (Close Stance)",
              uniqueName:"legpress",
              sets: 1,
              reps: "12-15",
              pose_analyzer: true,
              description: "Quad dominant press variation",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings"],
              video:"/videos/legs/Leg_press.mp4"
            },
            {
              id: 3,
              name: "Leg Press (Wide Stance)",
              uniqueName:"legpress",
              sets: 1,
              reps: "12-15",
              pose_analyzer: true,
              description: "Glute and hamstring emphasis",
              primaryMuscle: "Glutes",
              secondaryMuscles: ["Hamstrings", "Quadriceps"],
              video:"/videos/legs/Leg_press.mp4"
            },
            {
              id: 4,
              name: "Leg Press (Feet High)",
              uniqueName:"legpress",
              sets: 1,
              reps: "12-15",
              pose_analyzer: true,
              description: "Hamstring and glute focus",
              primaryMuscle: "Hamstrings",
              secondaryMuscles: ["Glutes", "Quadriceps"],
              video:"/videos/legs/Leg_press.mp4"
            },
            {
              id: 5,
              name: "Calf Raises",
              sets: 2,
              reps: "15-20",
              pose_analyzer: false,
              description: "Calf hypertrophy",
              primaryMuscle: "Calves",
              secondaryMuscles: []
            },
            {
              id: 6,
              name: "Chest Supported Shoulder Press",
              uniqueName:"chestsupportedshoulderpress",
              sets: 2,
              reps: "12",
              pose_analyzer: true,
              description: "Shoulder press with chest support",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Triceps"]
            },
            {
              id: 7,
              name: "Cable Lateral Raises",
              uniqueName:"chestsupportedshoulderpress",
              sets: 2,
              reps: "15",
              pose_analyzer: true,
              description: "Medial delt isolation",
              primaryMuscle: "Shoulders",
              secondaryMuscles: []
            },
            {
              id: 8,
              name: "Overhead Shoulder Press",
              uniqueName:"overheadshoulderpress",
              sets: 2,
              reps: "12",
              pose_analyzer: true,
              description: "Compound shoulder strength",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Triceps", "Upper Chest"]
            },
            {
              id: 9,
              name: "Cable Rope Press",
              uniqueName:"biceps",
              sets: 2,
              reps: "15",
              pose_analyzer: true,
              description: "Shoulder cable press variation",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Triceps"]
            },
            {
              id: 10,
              name: "Front Raises",
              uniqueName:"chestsupportedshoulderpress",
              sets: 2,
              reps: "12",
              pose_analyzer: true,
              description: "Front delt isolation",
              primaryMuscle: "Front Deltoids",
              secondaryMuscles: ["Upper Chest"]
            },
            {
              id: 11,
              name: "Abs Circuit",
              sets: 3,
              reps: "Varied",
              pose_analyzer: false,
              description: "Core strengthening (planks, crunches, leg raises)",
              primaryMuscle: "Abs",
              secondaryMuscles: ["Obliques", "Lower Back"]
            }
          ]
        }
      }
    },
    upperLower: {
      name: "Upper/Lower",
      description: "Balanced strength split",
      duration: "4 days/week",
      type: "Strength",
      days: {
        upper: {
          name: "Upper Body",
          exercises: [
            {
              id: 1,
              name: "Bench Press",
              sets: 4,
              reps: "6-8",
              pose_analyzer: true,
              description: "Heavy chest work",
              primaryMuscle: "Chest",
              secondaryMuscles: ["Triceps", "Front Deltoids"]
            },
            {
              id: 2,
              name: "Pull-ups",
              sets: 4,
              reps: "8-10",
              pose_analyzer: true,
              description: "Back strength",
              primaryMuscle: "Lats",
              secondaryMuscles: ["Rhomboids", "Middle Traps", "Biceps", "Rear Deltoids"]
            },
            {
              id: 3,
              name: "Overhead Press",
              sets: 3,
              reps: "8-10",
              pose_analyzer: true,
              description: "Shoulder power",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Triceps", "Upper Chest", "Core"]
            },
            {
              id: 4,
              name: "Barbell Rows",
              sets: 3,
              reps: "8-10",
              pose_analyzer: true,
              description: "Rowing movement",
              primaryMuscle: "Middle Traps",
              secondaryMuscles: ["Rhomboids", "Lats", "Biceps", "Rear Deltoids"]
            }
          ]
        },
        lower: {
          name: "Lower Body",
          exercises: [
            {
              id: 1,
              name: "Squats",
              sets: 4,
              reps: "6-8",
              pose_analyzer: true,
              description: "Heavy squats",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Calves", "Core"]
            },
            {
              id: 2,
              name: "Deadlifts",
              sets: 3,
              reps: "5-6",
              pose_analyzer: true,
              description: "Posterior chain",
              primaryMuscle: "Hamstrings",
              secondaryMuscles: ["Glutes", "Lower Back", "Upper Traps", "Forearms", "Core"]
            },
            {
              id: 3,
              name: "Lunges",
              sets: 3,
              reps: "12 each",
              pose_analyzer: true,
              description: "Unilateral work",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Calves", "Core"]
            },
            {
              id: 4,
              name: "Hip Thrusts",
              sets: 3,
              reps: "12-15",
              pose_analyzer: true,
              description: "Glute activation",
              primaryMuscle: "Glutes",
              secondaryMuscles: ["Hamstrings", "Core"]
            }
          ]
        }
      }
    },
    fullBody: {
      name: "Full Body",
      description: "Efficiency for beginners",
      duration: "3 days/week",
      type: "Beginner-Friendly",
      days: {
        workout: {
          name: "Full Body Workout",
          exercises: [
            {
              id: 1,
              name: "Squats",
              sets: 3,
              reps: "10-12",
              pose_analyzer: true,
              description: "Compound leg movement",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Calves", "Core"]
            },
            {
              id: 2,
              name: "Push-ups",
              sets: 3,
              reps: "8-12",
              pose_analyzer: true,
              description: "Upper body push",
              primaryMuscle: "Chest",
              secondaryMuscles: ["Triceps", "Front Deltoids", "Core"]
            },
            {
              id: 3,
              name: "Bent-over Rows",
              sets: 3,
              reps: "10-12",
              pose_analyzer: true,
              description: "Upper body pull",
              primaryMuscle: "Middle Traps",
              secondaryMuscles: ["Rhomboids", "Lats", "Biceps", "Rear Deltoids"]
            },
            {
              id: 4,
              name: "Overhead Press",
              sets: 3,
              reps: "8-10",
              pose_analyzer: true,
              description: "Shoulder development",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Triceps", "Upper Chest", "Core"]
            },
            {
              id: 5,
              name: "Plank",
              sets: 3,
              reps: "30-60s",
              pose_analyzer: true,
              description: "Core stability",
              primaryMuscle: "Core",
              secondaryMuscles: ["Shoulders", "Glutes"]
            },
            {
              id: 6,
              name: "Glute Bridges",
              sets: 3,
              reps: "12-15",
              pose_analyzer: true,
              description: "Posterior chain",
              primaryMuscle: "Glutes",
              secondaryMuscles: ["Hamstrings", "Core"]
            }
          ]
        }
      }
    },
    broSplit: {
      name: "Bro-Split",
      description: "Focused body part days",
      duration: "5 days/week",
      type: "Bodybuilding",
      days: {
        chest: {
          name: "Chest Day",
          exercises: [
            {
              id: 1,
              name: "Bench Press",
              sets: 4,
              reps: "8-10",
              pose_analyzer: true,
              description: "Heavy chest compound",
              primaryMuscle: "Chest",
              secondaryMuscles: ["Triceps", "Front Deltoids"]
            },
            {
              id: 2,
              name: "Incline Dumbbell Press",
              sets: 4,
              reps: "10-12",
              pose_analyzer: true,
              description: "Upper chest focus",
              primaryMuscle: "Upper Chest",
              secondaryMuscles: ["Front Deltoids", "Triceps"]
            },
            {
              id: 3,
              name: "Chest Flyes",
              sets: 3,
              reps: "12-15",
              pose_analyzer: true,
              description: "Chest isolation",
              primaryMuscle: "Chest",
              secondaryMuscles: ["Front Deltoids"]
            },
            {
              id: 4,
              name: "Dips",
              sets: 3,
              reps: "10-12",
              pose_analyzer: true,
              description: "Lower chest emphasis",
              primaryMuscle: "Lower Chest",
              secondaryMuscles: ["Triceps", "Front Deltoids"]
            }
          ]
        },
        back: {
          name: "Back Day",
          exercises: [
            {
              id: 1,
              name: "Deadlifts",
              sets: 4,
              reps: "6-8",
              pose_analyzer: true,
              description: "Heavy back compound",
              primaryMuscle: "Lower Back",
              secondaryMuscles: ["Hamstrings", "Glutes", "Upper Traps", "Lats", "Forearms"]
            },
            {
              id: 2,
              name: "Pull-ups",
              sets: 4,
              reps: "8-12",
              pose_analyzer: true,
              description: "Lat development",
              primaryMuscle: "Lats",
              secondaryMuscles: ["Rhomboids", "Middle Traps", "Biceps", "Rear Deltoids"]
            },
            {
              id: 3,
              name: "Barbell Rows",
              sets: 4,
              reps: "10-12",
              pose_analyzer: true,
              description: "Mid-back thickness",
              primaryMuscle: "Middle Traps",
              secondaryMuscles: ["Rhomboids", "Lats", "Biceps", "Rear Deltoids"]
            },
            {
              id: 4,
              name: "Cable Rows",
              sets: 3,
              reps: "12-15",
              pose_analyzer: true,
              description: "Back width",
              primaryMuscle: "Middle Traps",
              secondaryMuscles: ["Rhomboids", "Lats", "Biceps"]
            }
          ]
        },
        arms: {
          name: "Arms Day",
          exercises: [
            {
              id: 1,
              name: "Barbell Curls",
              sets: 4,
              reps: "10-12",
              pose_analyzer: true,
              description: "Bicep mass",
              primaryMuscle: "Biceps",
              secondaryMuscles: ["Forearms"]
            },
            {
              id: 2,
              name: "Close-Grip Bench Press",
              sets: 4,
              reps: "8-10",
              pose_analyzer: true,
              description: "Tricep compound",
              primaryMuscle: "Triceps",
              secondaryMuscles: ["Chest", "Front Deltoids"]
            },
            {
              id: 3,
              name: "Hammer Curls",
              sets: 3,
              reps: "12-15",
              pose_analyzer: true,
              description: "Bicep variation",
              primaryMuscle: "Biceps",
              secondaryMuscles: ["Forearms", "Brachialis"]
            },
            {
              id: 4,
              name: "Tricep Extensions",
              sets: 3,
              reps: "12-15",
              pose_analyzer: true,
              description: "Tricep isolation",
              primaryMuscle: "Triceps",
              secondaryMuscles: []
            }
          ]
        },
        legs: {
          name: "Legs Day",
          exercises: [
            {
              id: 1,
              name: "Squats",
              sets: 4,
              reps: "8-12",
              pose_analyzer: true,
              description: "Quad development",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Calves", "Core"]
            },
            {
              id: 2,
              name: "Romanian Deadlifts",
              sets: 4,
              reps: "10-12",
              pose_analyzer: true,
              description: "Hamstring focus",
              primaryMuscle: "Hamstrings",
              secondaryMuscles: ["Glutes", "Lower Back", "Core"]
            },
            {
              id: 3,
              name: "Leg Press",
              sets: 3,
              reps: "15-20",
              pose_analyzer: true,
              description: "Quad isolation",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings"]
            },
            {
              id: 4,
              name: "Calf Raises",
              sets: 4,
              reps: "15-20",
              pose_analyzer: false,
              description: "Calf development",
              primaryMuscle: "Calves",
              secondaryMuscles: []
            }
          ]
        },
        shoulders: {
          name: "Shoulders Day",
          exercises: [
            {
              id: 1,
              name: "Overhead Press",
              sets: 4,
              reps: "8-10",
              pose_analyzer: true,
              description: "Shoulder compound",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Triceps", "Upper Chest", "Core"]
            },
            {
              id: 2,
              name: "Lateral Raises",
              sets: 4,
              reps: "12-15",
              pose_analyzer: true,
              description: "Side delt focus",
              primaryMuscle: "Side Deltoids",
              secondaryMuscles: []
            },
            {
              id: 3,
              name: "Rear Delt Flyes",
              sets: 3,
              reps: "15-20",
              pose_analyzer: true,
              description: "Rear delt isolation",
              primaryMuscle: "Rear Deltoids",
              secondaryMuscles: ["Rhomboids", "Middle Traps"]
            },
            {
              id: 4,
              name: "Upright Rows",
              sets: 3,
              reps: "12-15",
              pose_analyzer: true,
              description: "Shoulder width",
              primaryMuscle: "Side Deltoids",
              secondaryMuscles: ["Upper Traps", "Biceps"]
            }
          ]
        }
      }
    },
    hybrid: {
      name: "Hybrid Split",
      description: "Strength + Conditioning mix for athletes",
      duration: "4 days/week",
      type: "Athletic Performance",
      days: {
        strengthUpper: {
          name: "Strength Upper",
          exercises: [
            {
              id: 1,
              name: "Bench Press",
              sets: 5,
              reps: "3-5",
              pose_analyzer: true,
              description: "Heavy strength work",
              primaryMuscle: "Chest",
              secondaryMuscles: ["Triceps", "Front Deltoids"]
            },
            {
              id: 2,
              name: "Pull-ups",
              sets: 4,
              reps: "6-8",
              pose_analyzer: true,
              description: "Weighted if possible",
              primaryMuscle: "Lats",
              secondaryMuscles: ["Rhomboids", "Middle Traps", "Biceps", "Rear Deltoids"]
            },
            {
              id: 3,
              name: "Overhead Press",
              sets: 4,
              reps: "5-6",
              pose_analyzer: true,
              description: "Shoulder strength",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Triceps", "Upper Chest", "Core"]
            },
            {
              id: 4,
              name: "Battle Ropes",
              sets: 3,
              reps: "30s",
              pose_analyzer: false,
              description: "Conditioning finisher",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Core", "Forearms", "Cardio"]
            }
          ]
        },
        strengthLower: {
          name: "Strength Lower",
          exercises: [
            {
              id: 1,
              name: "Squats",
              sets: 5,
              reps: "3-5",
              pose_analyzer: true,
              description: "Heavy strength squats",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Calves", "Core"]
            },
            {
              id: 2,
              name: "Deadlifts",
              sets: 4,
              reps: "3-5",
              pose_analyzer: true,
              description: "Heavy pulling",
              primaryMuscle: "Hamstrings",
              secondaryMuscles: ["Glutes", "Lower Back", "Upper Traps", "Lats", "Forearms"]
            },
            {
              id: 3,
              name: "Box Jumps",
              sets: 4,
              reps: "8-10",
              pose_analyzer: true,
              description: "Explosive power",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Calves", "Core"]
            },
            {
              id: 4,
              name: "Sled Push",
              sets: 3,
              reps: "20m",
              pose_analyzer: false,
              description: "Conditioning finisher",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Core", "Cardio"]
            }
          ]
        },
        conditioning: {
          name: "Conditioning",
          exercises: [
            {
              id: 1,
              name: "Burpees",
              sets: 4,
              reps: "10-15",
              pose_analyzer: true,
              description: "Full body cardio",
              primaryMuscle: "Full Body",
              secondaryMuscles: ["Cardio", "Core", "Shoulders"]
            },
            {
              id: 2,
              name: "Mountain Climbers",
              sets: 4,
              reps: "30s",
              pose_analyzer: true,
              description: "Core and cardio",
              primaryMuscle: "Core",
              secondaryMuscles: ["Shoulders", "Quadriceps", "Cardio"]
            },
            {
              id: 3,
              name: "Kettlebell Swings",
              sets: 4,
              reps: "20-25",
              pose_analyzer: true,
              description: "Power endurance",
              primaryMuscle: "Glutes",
              secondaryMuscles: ["Hamstrings", "Core", "Shoulders", "Cardio"]
            },
            {
              id: 4,
              name: "High Knees",
              sets: 3,
              reps: "30s",
              pose_analyzer: false,
              description: "Cardio finisher",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Hip Flexors", "Cardio", "Core"]
            }
          ]
        },
        recovery: {
          name: "Active Recovery",
          exercises: [
            {
              id: 1,
              name: "Light Squats",
              sets: 3,
              reps: "15-20",
              pose_analyzer: true,
              description: "Movement quality",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Mobility"]
            },
            {
              id: 2,
              name: "Band Pull-Aparts",
              sets: 3,
              reps: "20-25",
              pose_analyzer: false,
              description: "Shoulder health",
              primaryMuscle: "Rear Deltoids",
              secondaryMuscles: ["Rhomboids", "Middle Traps"]
            },
            {
              id: 3,
              name: "Plank",
              sets: 3,
              reps: "45-60s",
              pose_analyzer: true,
              description: "Core stability",
              primaryMuscle: "Core",
              secondaryMuscles: ["Shoulders", "Glutes"]
            },
            {
              id: 4,
              name: "Walking",
              sets: 1,
              reps: "20-30 mins",
              pose_analyzer: false,
              description: "Active recovery",
              primaryMuscle: "Cardio",
              secondaryMuscles: ["Calves", "Glutes", "Recovery"]
            }
          ]
        }
      }
    }
  },

  // Calisthenics Splits
  calisthenics: {
    beginner: {
      name: "Beginner Full Body",
      description: "Foundation bodyweight movements",
      duration: "3 days/week",
      type: "Skill Building",
      days: {
        fullBody: {
          name: "Full Body Basics",
          exercises: [
            {
              id: 1,
              name: "Push-ups",
              sets: 3,
              reps: "8-12",
              pose_analyzer: true,
              description: "Basic push movement",
              primaryMuscle: "Chest",
              secondaryMuscles: ["Triceps", "Front Deltoids", "Core"]
            },
            {
              id: 2,
              name: "Bodyweight Squats",
              sets: 3,
              reps: "15-20",
              pose_analyzer: true,
              description: "Leg strength",
              primaryMuscle: "Quadriceps",
              secondaryMuscles: ["Glutes", "Hamstrings", "Calves", "Core"]
            },
            {
              id: 3,
              name: "Plank",
              sets: 3,
              reps: "30-60s",
              pose_analyzer: true,
              description: "Core stability",
              primaryMuscle: "Core",
              secondaryMuscles: ["Shoulders", "Glutes"]
            },
            {
              id: 4,
              name: "Glute Bridges",
              sets: 3,
              reps: "15-20",
              pose_analyzer: true,
              description: "Posterior chain",
              primaryMuscle: "Glutes",
              secondaryMuscles: ["Hamstrings", "Core"]
            }
          ]
        }
      }
    },
    skillProgression: {
      name: "Skill Progression",
      description: "Advanced calisthenics skills",
      duration: "5 days/week",
      type: "Skill Development",
      days: {
        planche: {
          name: "Planche Training",
          exercises: [
            {
              id: 1,
              name: "Planche Lean",
              sets: 5,
              reps: "20-30s",
              pose_analyzer: true,
              description: "Planche preparation",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Core", "Chest", "Triceps"]
            },
            {
              id: 2,
              name: "Pseudo Planche Push-ups",
              sets: 4,
              reps: "5-8",
              pose_analyzer: true,
              description: "Strength building",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Chest", "Triceps", "Core"]
            },
            {
              id: 3,
              name: "Tuck Planche Hold",
              sets: 4,
              reps: "10-20s",
              pose_analyzer: true,
              description: "Static hold",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Core", "Chest", "Triceps"]
            },
            {
              id: 4,
              name: "Planche Push-ups",
              sets: 3,
              reps: "3-5",
              pose_analyzer: true,
              description: "Advanced movement",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Chest", "Triceps", "Core"]
            }
          ]
        },
        handstand: {
          name: "Handstand Training",
          exercises: [
            {
              id: 1,
              name: "Wall Handstand",
              sets: 4,
              reps: "30-60s",
              pose_analyzer: true,
              description: "Balance practice",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Core", "Triceps", "Balance"]
            },
            {
              id: 2,
              name: "Hollow Body Hold",
              sets: 4,
              reps: "30-45s",
              pose_analyzer: true,
              description: "Core strength",
              primaryMuscle: "Core",
              secondaryMuscles: ["Hip Flexors", "Shoulders"]
            },
            {
              id: 3,
              name: "Handstand Push-ups",
              sets: 3,
              reps: "5-8",
              pose_analyzer: true,
              description: "Vertical pressing",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Triceps", "Upper Chest", "Core"]
            },
            {
              id: 4,
              name: "Freestanding Handstand",
              sets: 5,
              reps: "10-30s",
              pose_analyzer: true,
              description: "Balance skill",
              primaryMuscle: "Shoulders",
              secondaryMuscles: ["Core", "Balance", "Proprioception"]
            }
          ]
        }
      }
    }
  },

  // Stretching & Yoga (Combined)
  stretching: {
    fullBody: {
      name: "Full Body Stretch",
      description: "Complete flexibility routine",
      duration: "20-30 mins",
      type: "Flexibility",
      sequence: [
        { pose: "Child's Pose", duration: "60s", description: "Relaxation and hip opening" },
        { pose: "Cat-Cow Stretch", duration: "45s", description: "Spinal mobility" },
        { pose: "Downward Dog", duration: "60s", description: "Full body stretch" },
        { pose: "Forward Fold", duration: "45s", description: "Hamstring flexibility" },
        { pose: "Hip Flexor Stretch", duration: "30s each", description: "Hip mobility" },
        { pose: "Shoulder Rolls", duration: "30s", description: "Shoulder mobility" }
      ]
    },
    morning: {
      name: "Morning Energizer",
      description: "Wake up your body",
      duration: "10-15 mins",
      type: "Energy",
      sequence: [
        { pose: "Sun Salutation A", duration: "3 rounds", description: "Full body warm-up" },
        { pose: "Warrior I", duration: "30s each", description: "Hip opener and strength" },
        { pose: "Triangle Pose", duration: "30s each", description: "Side body stretch" },
        { pose: "Tree Pose", duration: "30s each", description: "Balance and focus" }
      ]
    },
    beginnerFlow: {
      name: "Beginner Flow",
      description: "Gentle introduction to yoga",
      duration: "20-25 mins",
      type: "Gentle",
      sequence: [
        { pose: "Mountain Pose", duration: "30s", description: "Grounding and centering" },
        { pose: "Forward Fold", duration: "45s", description: "Hamstring release" },
        { pose: "Cobra Pose", duration: "30s", description: "Heart opening" },
        { pose: "Child's Pose", duration: "60s", description: "Rest and restoration" },
        { pose: "Seated Twist", duration: "30s each", description: "Spinal mobility" },
        { pose: "Savasana", duration: "3-5 mins", description: "Final relaxation" }
      ]
    },
    sleepYoga: {
      name: "Sleep Yoga",
      description: "Calming bedtime routine",
      duration: "15-20 mins",
      type: "Restorative",
      sequence: [
        { pose: "Legs Up Wall", duration: "3 mins", description: "Circulation and calm" },
        { pose: "Supine Twist", duration: "1 min each", description: "Gentle spinal release" },
        { pose: "Happy Baby", duration: "1 min", description: "Hip release" },
        { pose: "Corpse Pose", duration: "5-10 mins", description: "Deep relaxation" }
      ]
    }
  }
}

// Exercise Library for Custom Workouts
export const exerciseLibrary = {
  gym: [
    { id: 'bench-press', name: 'Bench Press', sets: 4, reps: '8-12', pose_analyzer: true },
    { id: 'squats', name: 'Squats', sets: 4, reps: '8-12', pose_analyzer: true },
    { id: 'deadlifts', name: 'Deadlifts', sets: 3, reps: '5-8', pose_analyzer: true },
    { id: 'pull-ups', name: 'Pull-ups', sets: 3, reps: '6-10', pose_analyzer: true },
    { id: 'overhead-press', name: 'Overhead Press', sets: 3, reps: '8-10', pose_analyzer: true },
    { id: 'barbell-rows', name: 'Barbell Rows', sets: 4, reps: '8-12', pose_analyzer: true }
  ],
  calisthenics: [
    { id: 'push-ups', name: 'Push-ups', sets: 3, reps: '10-15', pose_analyzer: true },
    { id: 'burpees', name: 'Burpees', sets: 3, reps: '8-12', pose_analyzer: true },
    { id: 'plank', name: 'Plank', sets: 3, reps: '30-60s', pose_analyzer: true },
    { id: 'mountain-climbers', name: 'Mountain Climbers', sets: 3, reps: '20 each', pose_analyzer: true },
    { id: 'jump-squats', name: 'Jump Squats', sets: 3, reps: '12-15', pose_analyzer: true },
    { id: 'pike-push-ups', name: 'Pike Push-ups', sets: 3, reps: '8-12', pose_analyzer: true }
  ],
  stretching: [
    { id: 'forward-fold', name: 'Forward Fold', duration: '45s', pose_analyzer: false },
    { id: 'hip-flexor', name: 'Hip Flexor Stretch', duration: '30s each', pose_analyzer: false },
    { id: 'shoulder-rolls', name: 'Shoulder Rolls', duration: '30s', pose_analyzer: false },
    { id: 'cat-cow', name: 'Cat-Cow Stretch', duration: '45s', pose_analyzer: false },
    { id: 'pigeon-pose', name: 'Pigeon Pose', duration: '60s each', pose_analyzer: false }
  ],
  yoga: [
    { id: 'downward-dog', name: 'Downward Dog', duration: '60s', pose_analyzer: false },
    { id: 'warrior-1', name: 'Warrior I', duration: '30s each', pose_analyzer: false },
    { id: 'child-pose', name: "Child's Pose", duration: '60s', pose_analyzer: false },
    { id: 'cobra-pose', name: 'Cobra Pose', duration: '30s', pose_analyzer: false },
    { id: 'tree-pose', name: 'Tree Pose', duration: '30s each', pose_analyzer: false }
  ]
}
