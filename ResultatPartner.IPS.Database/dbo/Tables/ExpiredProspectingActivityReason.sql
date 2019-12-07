CREATE TABLE [dbo].[ExpiredProspectingActivityReason] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [ProspectingActivityId] INT            NOT NULL,
    [Reason]                NVARCHAR (MAX) NOT NULL,
    [CreatedOn]             DATETIME       NOT NULL,
    [CreatedBy]             INT            NOT NULL,
    CONSTRAINT [PK_ExpiredProspectingActivityReason] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ExpiredProspectingActivityReason_ProspectingActivities] FOREIGN KEY ([ProspectingActivityId]) REFERENCES [dbo].[ProspectingActivities] ([Id])
);

