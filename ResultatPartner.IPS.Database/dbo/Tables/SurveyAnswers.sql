CREATE TABLE [dbo].[SurveyAnswers] (
    [Id]			INT            IDENTITY (1, 1) NOT NULL,
    [SurveyResultId]	INT        NOT NULL,
	[QuestionId]    INT			   NOT NULL,
    [IsCorrect]		BIT            NULL,
    [Answer]		NVARCHAR (MAX) NULL,
	[Comment]       NVARCHAR (MAX) NULL,
	[InDevContract]   BIT      NULL,
    CONSTRAINT [PK_SurveyAnswers] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_SurveyAnswers_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions] ([Id]),
    CONSTRAINT [FK_SurveyAnswers_SurveyResults] FOREIGN KEY ([SurveyResultId]) REFERENCES [dbo].[SurveyResults] ([Id])
);