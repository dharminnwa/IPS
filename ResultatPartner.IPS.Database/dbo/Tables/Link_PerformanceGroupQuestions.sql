CREATE TABLE [dbo].[Link_PerformanceGroupQuestions] (
    [PerformanceGroupSkillId] INT NOT NULL,
    [QuestionId]              INT NOT NULL,
    CONSTRAINT [PK_PerformanceGroupQuestions] PRIMARY KEY CLUSTERED ([PerformanceGroupSkillId] ASC, [QuestionId] ASC),
    CONSTRAINT [FK_PerformanceGroupQuestions_PerformanceGroupSkills] FOREIGN KEY ([PerformanceGroupSkillId]) REFERENCES [dbo].[Link_PerformanceGroupSkills] ([Id]),
    CONSTRAINT [FK_PerformanceGroupQuestions_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id])
);

