CREATE TABLE [dbo].[ProspectingGoalInfo] (
    [Id]                     INT           IDENTITY (1, 1) NOT NULL,
    [Name]                   VARCHAR (50)  NOT NULL,
    [ProfileId]              INT           NULL,
    [ProjectId]              INT           NULL,
    [ParticipantId]          INT           NULL,
    [GoalStartDate]          DATETIME      NULL,
    [GoalEndDate]            DATETIME      NULL,
    [CreatedOn]              DATETIME      NULL,
    [CreatedBy]              INT           NULL,
    [ModifiedOn]             DATETIME      NULL,
    [ModifiedBy]             INT           NULL,
    [UserId]                 INT           NULL,
    [RecurrenceRule]         VARCHAR (100) NULL,
    [TaskId]                 INT           NULL,
    [ProspectingGoalScaleId] INT           NULL,
    [ProspectingType]        INT           CONSTRAINT [DF_ProspectingGoalInfo_ProspectingType] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_ProspectingGoal] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingGoal_EvaluationParticipants] FOREIGN KEY ([ParticipantId]) REFERENCES [dbo].[EvaluationParticipants] ([Id]),
    CONSTRAINT [FK_ProspectingGoal_Profiles] FOREIGN KEY ([ProfileId]) REFERENCES [dbo].[Profiles] ([Id]),
    CONSTRAINT [FK_ProspectingGoal_Projects] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id]),
    CONSTRAINT [FK_ProspectingGoal_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]),
    CONSTRAINT [FK_ProspectingGoalInfo_ProspectingGoalScales] FOREIGN KEY ([ProspectingGoalScaleId]) REFERENCES [dbo].[ProspectingGoalScales] ([Id]),
    CONSTRAINT [FK_ProspectingGoalInfo_Tasks] FOREIGN KEY ([TaskId]) REFERENCES [dbo].[Tasks] ([Id])
);











