CREATE TABLE [dbo].[Link_SurveyAnswersTrainings] (
    [TrainingId]    INT    NOT NULL,
    [SurveyAnswerId]  INT    NOT NULL
	CONSTRAINT [PK_SurveyAnswersTrainings] PRIMARY KEY CLUSTERED ([TrainingId] ASC, [SurveyAnswerId] ASC),
    CONSTRAINT [FK_SurveyAnswersTrainings_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id]),
    CONSTRAINT [FK_SurveyAnswersTrainings_SurveyAnswers] FOREIGN KEY ([SurveyAnswerId]) REFERENCES [dbo].[SurveyAnswers] ([Id])
);