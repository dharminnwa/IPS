CREATE TABLE [dbo].[ProspectingActivityLog] (
    [Id]                    INT          IDENTITY (1, 1) NOT NULL,
    [ProspectingActivityId] INT          NULL,
    [Event]                 VARCHAR (20) NULL,
    [EventTime]             DATETIME     NULL,
    [CreatedOn]             DATETIME     NULL,
    [CreatedBy]             INT          NULL,
    CONSTRAINT [PK_ProspectingActivityLog] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingActivityLog_ProspectingActivities] FOREIGN KEY ([ProspectingActivityId]) REFERENCES [dbo].[ProspectingActivities] ([Id])
);



