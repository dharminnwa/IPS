CREATE TABLE [dbo].[DailyEvaluation] (
    [Id]        INT           IDENTITY (1, 1) NOT NULL,
    [UserId]    INT           NOT NULL,
    [TimeStamp] SMALLDATETIME NOT NULL,
    [Rating]    INT           NOT NULL,
    CONSTRAINT [PK_DailyEvaluation] PRIMARY KEY CLUSTERED ([Id] ASC)
);

