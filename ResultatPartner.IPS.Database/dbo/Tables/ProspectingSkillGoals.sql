CREATE TABLE [dbo].[ProspectingSkillGoals] (
    [Id]                INT IDENTITY (1, 1) NOT NULL,
    [ProspectingGoalId] INT NOT NULL,
    [SkillId]           INT NOT NULL,
    [Goal]              INT NOT NULL,
    CONSTRAINT [PK_ProspectingSkillGoals] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingSkillGoals_ProspectingGoalInfo] FOREIGN KEY ([ProspectingGoalId]) REFERENCES [dbo].[ProspectingGoalInfo] ([Id]),
    CONSTRAINT [FK_ProspectingSkillGoals_Skills] FOREIGN KEY ([SkillId]) REFERENCES [dbo].[Skills] ([Id])
);

