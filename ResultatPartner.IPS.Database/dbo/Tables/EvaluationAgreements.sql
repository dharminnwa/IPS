CREATE TABLE [dbo].[EvaluationAgreements] (
    [StageId]            INT             NOT NULL,
    [ParticipantId]      INT             NOT NULL,
    [QuestionId]         INT             NOT NULL,
    [KPIType]            INT             NOT NULL,
    [ShortGoal]          NUMERIC (18, 2) NULL,
    [Comment]            NVARCHAR (MAX)  NULL,
    [Id]                 INT             IDENTITY (1, 1) NOT NULL,
    [FinalScore]         NUMERIC (18, 2) NULL,
    [MidGoal]            NUMERIC (18, 2) NULL,
    [LongGoal]           NUMERIC (18, 2) NULL,
    [FinalGoal]          NUMERIC (18, 2) NULL,
    [IsFinalScoreCopied] BIT             CONSTRAINT [DF_EvaluationAgreements_IsFinalScoreCopied] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_EvaluationAgreements] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_EvaluationAgreements_EvaluationParticipants] FOREIGN KEY ([ParticipantId]) REFERENCES [dbo].[EvaluationParticipants] ([Id]),
    CONSTRAINT [FK_EvaluationAgreements_KPITypes] FOREIGN KEY ([KPIType]) REFERENCES [dbo].[KPITypes] ([Id]),
    CONSTRAINT [FK_EvaluationAgreements_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id]),
    CONSTRAINT [FK_EvaluationAgreements_Stages] FOREIGN KEY ([StageId]) REFERENCES [dbo].[Stages] ([Id])
);













