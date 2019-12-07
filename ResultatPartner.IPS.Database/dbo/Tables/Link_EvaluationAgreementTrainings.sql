CREATE TABLE [dbo].[Link_EvaluationAgreementTrainings] (
    [EvaluationAgreementId] INT NOT NULL,
    [TrainingId]            INT NOT NULL,
    CONSTRAINT [PK_Link_EvaluationAgreementTrainings] PRIMARY KEY CLUSTERED ([EvaluationAgreementId] ASC, [TrainingId] ASC),
    CONSTRAINT [FK_Link_EvaluationAgreementTrainings_EvaluationAgreements] FOREIGN KEY ([EvaluationAgreementId]) REFERENCES [dbo].[EvaluationAgreements] ([Id]),
    CONSTRAINT [FK_Link_EvaluationAgreementTrainings_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);

