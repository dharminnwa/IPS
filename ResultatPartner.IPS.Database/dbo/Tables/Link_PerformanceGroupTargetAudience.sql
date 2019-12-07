CREATE TABLE [dbo].[Link_PerformanceGroupTargetAudience] (
    [PerformanceGroupId] INT NOT NULL,
    [JobPositionID]      INT NOT NULL,
    CONSTRAINT [PK_Link_PerformanceGroupTargetAudience] PRIMARY KEY CLUSTERED ([JobPositionID] ASC, [PerformanceGroupId] ASC),
    CONSTRAINT [FK_Link_PerformanceGroupTargetAudience_JobPositions] FOREIGN KEY ([JobPositionID]) REFERENCES [dbo].[JobPositions] ([Id]),
    CONSTRAINT [FK_Link_PerformanceGroupTargetAudience_PerformanceGroups] FOREIGN KEY ([PerformanceGroupId]) REFERENCES [dbo].[PerformanceGroups] ([Id])
);

