CREATE TABLE [dbo].[SurveyResults] (
    [Id]            INT            IDENTITY (1, 1) NOT NULL,
    [ParticipantId] INT            NOT NULL,
    [StageId]       INT            NULL,
    [TimeSpent]		INT				NOT NULL,
    [StageEvolutionId] INT NULL, 
    CONSTRAINT [PK_SurveyResults] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_SurveyResults_EvaluationParticipants] FOREIGN KEY ([ParticipantId]) REFERENCES [dbo].[EvaluationParticipants] ([Id]),
    CONSTRAINT [FK_SurveyResults_Stages] FOREIGN KEY ([StageId]) REFERENCES [dbo].[Stages] ([Id]),
    CONSTRAINT [FK_SurveyResults_StagesEvolution] FOREIGN KEY ([StageEvolutionId]) REFERENCES [dbo].[StagesEvolution] ([Id])
);