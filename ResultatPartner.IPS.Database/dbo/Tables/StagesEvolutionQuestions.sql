CREATE TABLE [dbo].[StagesEvolutionQuestions] (
	[Id]            INT            IDENTITY (1, 1) NOT NULL,
    [StageEvolutionId]				   INT			 NOT NULL,
    [QuestionId]					   INT			 NOT NULL,
	CONSTRAINT [PK_StagesEvolutionQuestions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_StagesEvolutionQuestion_StagesEvolution] FOREIGN KEY ([StageEvolutionId]) REFERENCES [dbo].[StagesEvolution] ([Id]),
    CONSTRAINT [FK_StagesEvolutionQuestion_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id])
);

