CREATE TABLE [dbo].[ProspectingGoalActivityInfo] (
    [Id]                      INT            IDENTITY (1, 1) NOT NULL,
    [ProfileId]               INT            NULL,
    [ProspectingGoalId]       INT            NOT NULL,
    [ActivityCalculationType] INT            CONSTRAINT [DF_ProspectingGoalActivityInfo_ActivityCalculationType] DEFAULT ((0)) NOT NULL,
    [ActivityTime]            INT            NOT NULL,
    [BreakTime]               INT            NOT NULL,
    [TotalActivities]         INT            NOT NULL,
    [ActivityStartTime]       DATETIME       NOT NULL,
    [ActivityEndTime]         DATETIME       NOT NULL,
    [UserId]                  INT            NULL,
    [CreatedOn]               DATETIME       NULL,
    [CreatedBy]               INT            NULL,
    [ModifiedOn]              DATETIME       NULL,
    [ModifiedBy]              INT            NULL,
    [Frequency]               NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_ProspectingGoalActivityInfo] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingGoalActivityInfo_ProspectingGoal] FOREIGN KEY ([ProspectingGoalId]) REFERENCES [dbo].[ProspectingGoalInfo] ([Id])
);





