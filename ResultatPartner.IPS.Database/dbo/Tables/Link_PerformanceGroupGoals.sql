CREATE TABLE [dbo].[Link_PerformanceGroupGoals] (
    [PerformanceGroupId] INT NOT NULL,
    [GoalId]             INT NOT NULL,
    CONSTRAINT [PK_Link_PerformanceGroupGoals] PRIMARY KEY CLUSTERED ([PerformanceGroupId] ASC, [GoalId] ASC),
    CONSTRAINT [FK_PerformanceGroupGoals_PerformanceGroups] FOREIGN KEY ([PerformanceGroupId]) REFERENCES [dbo].[PerformanceGroups] ([Id]),
    CONSTRAINT [FK_PerformanceGroupGoals_ScorecardGoals] FOREIGN KEY ([GoalId]) REFERENCES [dbo].[ScorecardGoals] ([Id])
);

