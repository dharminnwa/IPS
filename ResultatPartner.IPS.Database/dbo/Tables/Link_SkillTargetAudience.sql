CREATE TABLE [dbo].[Link_SkillTargetAudience] (
    [SkillId]       INT NOT NULL,
    [JobPositionID] INT NOT NULL,
    CONSTRAINT [PK_Link_SkillTargetAudience] PRIMARY KEY CLUSTERED ([JobPositionID] ASC, [SkillId] ASC),
    CONSTRAINT [FK_Link_SkillTargetAudience_JobPositions] FOREIGN KEY ([JobPositionID]) REFERENCES [dbo].[JobPositions] ([Id]),
    CONSTRAINT [FK_Link_SkillTargetAudience_Skills] FOREIGN KEY ([SkillId]) REFERENCES [dbo].[Skills] ([Id])
);

