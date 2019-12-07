CREATE TABLE [dbo].[ProspectingActivities] (
    [Id]                        INT          IDENTITY (1, 1) NOT NULL,
    [ProspectingGoalActivityId] INT          NOT NULL,
    [Name]                      VARCHAR (50) NOT NULL,
    [ActivityStart]             DATETIME     NOT NULL,
    [ActivityEnd]               DATETIME     NOT NULL,
    [CreatedOn]                 DATETIME     NULL,
    [CreatedBy]                 INT          NULL,
    [ModifiedOn]                DATETIME     NULL,
    [ModifiedBy]                INT          NULL,
    [StartTime]                 DATETIME     NULL,
    [StopTime]                  DATETIME     NULL,
    CONSTRAINT [PK_ProspectingActivities] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingActivities_ProspectingGoalActivityInfo] FOREIGN KEY ([ProspectingGoalActivityId]) REFERENCES [dbo].[ProspectingGoalActivityInfo] ([Id])
);



