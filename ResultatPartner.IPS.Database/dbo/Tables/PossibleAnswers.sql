CREATE TABLE [dbo].[PossibleAnswers](
 [QuestionId] [int] NOT NULL,
 [Answer] [nvarchar](max) NOT NULL
 CONSTRAINT [PK_PossibleAnswers] PRIMARY KEY CLUSTERED ([QuestionId] ASC),
    CONSTRAINT [FK_PossibleAnswers_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions]([Id]));
