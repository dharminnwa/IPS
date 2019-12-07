CREATE TABLE [dbo].[Link_PerformancGroupTrainings] (
    [PerformanceGroupSkillId] INT NOT NULL,
    [TrainingId]              INT NOT NULL,
    CONSTRAINT [PK_PerformancGroupTrainings] PRIMARY KEY CLUSTERED ([PerformanceGroupSkillId] ASC, [TrainingId] ASC),
    CONSTRAINT [FK_PerformancGroupTrainings_PerformanceGroupSkills] FOREIGN KEY ([PerformanceGroupSkillId]) REFERENCES [dbo].[Link_PerformanceGroupSkills] ([Id]),
    CONSTRAINT [FK_PerformancGroupTrainings_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);

