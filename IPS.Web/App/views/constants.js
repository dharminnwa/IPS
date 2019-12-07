angular.module('ips.constants')
    .constant('profilesTypesEnum', {
        soft: 1,
        knowledgetest: 5,
        hard: 3
    })
    .constant('evaluationRolesEnum', {
        evaluator: 1,
        participant: 2,
        manager: 3,
        trainer: 4,
        projectManager: 5
    })
    .constant("answerTypesEnum", {
        numeric: 1,
        text: 2,
        singleChoice: 3,
        multipleChoice: 4,
        order: 6
    })
    .constant('defaultQuestionValuesByAnswerTypeEnum', {
        numeric: { points: 1, minutesForQuestion: 2 },
        text: { points: 5, minutesForQuestion: 30 },
        singleChoice: { points: 1, minutesForQuestion: 2 },
        multipleChoice: { points: 2, minutesForQuestion: 3 },
        order: { points: 3, minutesForQuestion: 5 }
    })
    .constant("materialTypeEnum", {
        image: 1,
        document: 2,
        audio: 3,
        link: 4,
        video: 5
    })
    .constant('trainingSaveModeEnum', {
        create: 0,
        edit: 1,
        view: 2,
        createkpi: 3
    })
    .constant('trainingDiaryViewEnum', {
        Today: 1,
        UpComing: 2,
        History: 3,
    })
     .constant('evaluationFeedbackEnum', {
         Participant: 1,
         Evaluator: 2,
     })
    .constant('ktProfileTypesEnum', {
        start: { id: 1, label: "Start Stage" },
        final: { id: 2, label: "Final Stage" }
    })
    .constant('reminderEnum', [
    { value: -1440, text: "Before 1 day" },
    { value: -60, text: "Before 1 hour" },
    { value: -30, text: "Before 30 min" },
    { value: -15, text: "Before 15 min" },
    { value: -5, text: "Before 5 min" }]
    )
    .constant('eventTypeEnum', {
        Task: 1,
        OwnTraining: 2,
        ProfileTraining: 3,
        EvaluateParticipantTraining: 4
    })
    .constant('trainingStatusEnum', {
        Done: "Done",
        Active: "Active",
        Expired: "Expired",
        Paused: "Paused",
        UpComing: "Up Coming",
        PausedExpired: "Expired after paused"
    })

    .constant("passScoreIndicator", {
        passed: '#22b14c',
        failed: '#ed1c24',
        bronzeMedal: '#cd791f',
        silverMedal: '#dde3e6',
        goldMedal: '#ffd50f'
    })
    .constant('phasesLevelEnum', {
        planning: 1,
        execution: 2,
        measure: 3,
    })
.constant('projectPhasesEnum', {
    project: 1,
    profile: 2,
    training: 3,
    measure: 4
})
.constant('projectRolesEnum', {
    projectManager: 1,
    finalScoreManager: 2,
    evaluator: 3,
    participant: 4,
    manager: 5,
    trainer: 6
})
.constant('templateTypeEnum', {
    MilestoneStartNotification: 1,
    GreenMilestoneAlarm: 2,
    YellowMilestoneAlarm: 3,
    RedMilestoneAlarm: 4,
    ProfileTrainingNotification: 5,
    RecurrentTrainingNotification: 6,
    PersonalTrainingNotification: 7,
    Tasks: 8,
    MilestoneCompleteNotification: 9,
    MilestoneResultNotification: 10,
    GreenTrainingAlarm: 11,
    YellowTrainingAlarm: 12,
    RedTrainingAlarm: 13,
})
.constant('stageTypesEnum', {
    StartProfile: 1,
    ShortGoal: 2,
    MidGoal: 3,
    LongTermGoal: 4,
    FinalGoal: 5,
    Milestone: 6,
    TaskCreation : 7,
    TaskReminder: 8,
    MeetingSchedule : 9,
    FollowupSchedule : 10,
    SalesAgreed: 11
})

.constant('stateTypesEnum', {
    GreenAlarm: 1,
    YellowAlarm: 2,
    RedAlarm: 3,
    Start: 4,
    Completed: 5,
    Results: 5,
})
.constant('prospectingTypesEnum', {
    Sales: 1,
    Service: 2,
});
