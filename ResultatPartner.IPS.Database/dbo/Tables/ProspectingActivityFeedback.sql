CREATE TABLE [dbo].[ProspectingActivityFeedback] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [ProspectingActivityId] INT            NULL,
    [Rating]                INT            NULL,
    [WorkedWell]            NVARCHAR (MAX) NULL,
    [WorkedNotWell]         NVARCHAR (MAX) NULL,
    [WhatNextDescription]   NVARCHAR (MAX) NULL,
    [TimeSpentMinutes]      INT            NULL,
    [FeedbackDateTime]      DATETIME       NULL,
    [ActvityStartTime]      DATETIME       NULL,
    [ActvityEndTime]        DATETIME       NULL,
    [IsRecurrences]         BIT            NULL,
    [RecurrencesRule]       VARCHAR (100)  NULL,
    [IsParticipantPaused]   BIT            NULL,
    [ParticipantPausedAt]   DATETIME       NULL,
    [StartedAt]             DATETIME       NULL,
    CONSTRAINT [PK_ProspectingActivityFeedback] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingActivityFeedback_ProspectingActivities] FOREIGN KEY ([ProspectingActivityId]) REFERENCES [dbo].[ProspectingActivities] ([Id])
);



