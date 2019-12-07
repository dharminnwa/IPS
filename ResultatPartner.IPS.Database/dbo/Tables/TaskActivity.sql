CREATE TABLE [dbo].[TaskActivity] (
    [Id]                  INT           IDENTITY (1, 1) NOT NULL,
    [TaskId]              INT           NOT NULL,
    [RecurrenceStartTime] DATETIME      NULL,
    [RecurrenceEndTime]   DATETIME      NULL,
    [RecurrencesRule]     VARCHAR (100) NULL,
    [ActivityDateTime]    DATETIME      NULL,
    CONSTRAINT [PK_TaskActivity] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskActivity_Tasks] FOREIGN KEY ([TaskId]) REFERENCES [dbo].[Tasks] ([Id])
);

