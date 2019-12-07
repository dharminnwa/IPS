CREATE TABLE [dbo].[Link_PerformanceGroupSkills] (
    [Id]                 INT             IDENTITY (1, 1) NOT NULL,
    [PerformanceGroupId] INT             NOT NULL,
    [SkillId]            INT             NOT NULL,
    [SubSkillId]         INT             NULL,
    [Benchmark]          DECIMAL (18, 1) NULL,
    [Weight]             NVARCHAR (MAX)  NULL,
    [CSF]                NVARCHAR (MAX)  NULL,
    [Action]             NVARCHAR (MAX)  NULL,
    CONSTRAINT [PK_PerformanceGroupSkills] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PerformanceGroupSkills_PerformanceGroups] FOREIGN KEY ([PerformanceGroupId]) REFERENCES [dbo].[PerformanceGroups] ([Id]),
    CONSTRAINT [FK_PerformanceGroupSkills_Skills] FOREIGN KEY ([SkillId]) REFERENCES [dbo].[Skills] ([Id]),
    CONSTRAINT [FK_PerformanceGroupSkills_SkillsSubSkill] FOREIGN KEY ([SubSkillId]) REFERENCES [dbo].[Skills] ([Id])
);

