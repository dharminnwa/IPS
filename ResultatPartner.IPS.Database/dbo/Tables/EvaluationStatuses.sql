CREATE TABLE [dbo].[EvaluationStatuses] (
    [StageId]         INT      NULL,
    [ParticipantId]   INT      NOT NULL,
    [StartedAt]       DATETIME NULL,
    [EndedAt]         DATETIME NULL,
    [DurationMinutes] INT      NOT NULL,
    [InvitedAt]       DATETIME NULL,
    [RemindAt]        DATETIME NULL,
    [IsOpen]          BIT      CONSTRAINT [DF_EvaluationStatuses_IsOpen] DEFAULT ((0)) NOT NULL,
    [StageEvolutionId]   INT      NULL,
	[Id]          INT            IDENTITY (1, 1) NOT NULL,
    CONSTRAINT [PK_EvaluationStatuses] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_EvaluationStatuses_EvaluationParticipants] FOREIGN KEY ([ParticipantId]) REFERENCES [dbo].[EvaluationParticipants] ([Id]),
    CONSTRAINT [FK_EvaluationStatuses_Stages] FOREIGN KEY ([StageId]) REFERENCES [dbo].[Stages] ([Id]),
    CONSTRAINT [FK_EvaluationStatuses_StagesEvolution] FOREIGN KEY ([StageEvolutionId]) REFERENCES [dbo].[StagesEvolution] ([Id])
);

