CREATE TABLE [dbo].[MilestoneAgreementGoals] (
    [Id]                    INT             IDENTITY (1, 1) NOT NULL,
    [StageId]               INT             NOT NULL,
    [ParticipantId]         INT             NOT NULL,
    [Goal]                  NUMERIC (18, 2) NULL,
    [EvaluationAgreementId] INT             NOT NULL,
    [CreatedOn]             DATETIME        NULL,
    [CreatedBy]             INT             NULL,
    [ModifiedOn]            DATETIME        NULL,
    [ModifiedBy]            INT             NULL,
    CONSTRAINT [PK_MilestoneAgreementGoals] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_MilestoneAgreementGoals_EvaluationAgreements] FOREIGN KEY ([EvaluationAgreementId]) REFERENCES [dbo].[EvaluationAgreements] ([Id]),
    CONSTRAINT [FK_MilestoneAgreementGoals_EvaluationParticipants] FOREIGN KEY ([ParticipantId]) REFERENCES [dbo].[EvaluationParticipants] ([Id]),
    CONSTRAINT [FK_MilestoneAgreementGoals_Stages] FOREIGN KEY ([StageId]) REFERENCES [dbo].[Stages] ([Id])
);



