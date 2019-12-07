CREATE TABLE [dbo].[StagesEvolution] (
    [Id]                                       INT           IDENTITY (1, 1) NOT NULL,
	[OriginalStageId]						   INT			 NOT NULL,
	[ParentStageEvolutionId]				   INT			 NULL,
    [Name]                                     NVARCHAR (50) NOT NULL,
    [StartDate]	                               DATETIME      NOT NULL,
    [DueDate]                                  DATETIME      NOT NULL,
    [ParticipantId]							   INT			 NOT NULL,
    CONSTRAINT [PK_StagesEvolution] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_StagesEvolution_Stages] FOREIGN KEY ([OriginalStageId]) REFERENCES [dbo].[Stages] ([Id]),
    CONSTRAINT [FK_StagesEvolution_StagesEvolution] FOREIGN KEY ([ParentStageEvolutionId]) REFERENCES [dbo].[StagesEvolution] ([Id]),
    CONSTRAINT [FK_StagesEvolution_EvaluationParticipants] FOREIGN KEY ([ParticipantId]) REFERENCES [dbo].[EvaluationParticipants] ([Id])
);

