CREATE TABLE [dbo].[Link_SkillQuestions] (
    [QuestionId] INT NOT NULL,
    [SkillId]    INT NOT NULL,
    CONSTRAINT [PK_SkillQuestions] PRIMARY KEY CLUSTERED ([SkillId] ASC, [QuestionId] ASC),
    CONSTRAINT [FK_QuestionSkills_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id]),
    CONSTRAINT [FK_QuestionSkills_Skills] FOREIGN KEY ([SkillId]) REFERENCES [dbo].[Skills] ([Id])
);

