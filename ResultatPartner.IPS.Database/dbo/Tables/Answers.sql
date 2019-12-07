CREATE TABLE [dbo].[Answers] (
    [Id]            INT            IDENTITY (1, 1) NOT NULL,
    [ParticipantId] INT            NULL,
    [QuestionId]    INT            NOT NULL,
    [IsCorrect]     BIT            CONSTRAINT [DF_Answers_IsCorrect] DEFAULT ((0)) NOT NULL,
    [StageId]       INT            NULL,
    [Answer]        NVARCHAR (MAX) NULL,
    [KPIType]       INT            NULL,
    [Comment]       NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_AnswerAttempts] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Answers_EvaluationParticipants] FOREIGN KEY ([ParticipantId]) REFERENCES [dbo].[EvaluationParticipants] ([Id]),
    CONSTRAINT [FK_Answers_KPITypes] FOREIGN KEY ([KPIType]) REFERENCES [dbo].[KPITypes] ([Id]),
    CONSTRAINT [FK_Answers_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id]),
    CONSTRAINT [FK_Answers_Stages] FOREIGN KEY ([StageId]) REFERENCES [dbo].[Stages] ([Id])
);

