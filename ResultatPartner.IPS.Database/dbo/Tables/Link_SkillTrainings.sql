CREATE TABLE [dbo].[Link_SkillTrainings] (
    [SkillId]    INT NOT NULL,
    [TrainingId] INT NOT NULL,
    CONSTRAINT [PK_SkillTrainings] PRIMARY KEY CLUSTERED ([SkillId] ASC, [TrainingId] ASC),
    CONSTRAINT [FK_TrainingsSkills_Skills] FOREIGN KEY ([SkillId]) REFERENCES [dbo].[Skills] ([Id]),
    CONSTRAINT [FK_TrainingsSkills_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);

