CREATE TABLE [dbo].[Link_ProfileStageGroups] (
    [ProfileId]    INT NOT NULL,
    [StageGroupId] INT NOT NULL,
    CONSTRAINT [PK_Link_ProfileStageGroups] PRIMARY KEY CLUSTERED ([ProfileId] ASC, [StageGroupId] ASC),
    CONSTRAINT [FK_Link_ProfileStageGroups_Profiles] FOREIGN KEY ([ProfileId]) REFERENCES [dbo].[Profiles] ([Id]),
    CONSTRAINT [FK_Link_ProfileStageGroups_StageGroups] FOREIGN KEY ([StageGroupId]) REFERENCES [dbo].[StageGroups] ([Id])
);

