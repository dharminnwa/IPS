CREATE TABLE [dbo].[TrainingFeedback] (
    [Id]                    INT           IDENTITY (1, 1) NOT NULL,
    [TrainingId]            INT           NULL,
    [TaskId]                INT           NULL,
    [Rating]                INT           NULL,
    [WorkedWell]            VARCHAR (MAX) NULL,
    [WorkedNotWell]         VARCHAR (MAX) NULL,
    [WhatNextDescription]   VARCHAR (MAX) NULL,
    [TimeSpentMinutes]      INT           NULL,
    [FeedbackDateTime]      DATETIME      NULL,
    [RecurrencesStartTime]  DATETIME      NULL,
    [RecurrencesEndTime]    DATETIME      NULL,
    [IsRecurrences]         BIT           CONSTRAINT [DF_TrainingFeedback_IsRecurrences] DEFAULT ((0)) NOT NULL,
    [RecurrencesRule]       VARCHAR (100) NULL,
    [IsEvaluatorFeedBack]   BIT           CONSTRAINT [DF_TrainingFeedback_IsEvaluatorFeedBack] DEFAULT ((0)) NOT NULL,
    [EvaluatorId]           INT           NULL,
    [EvaluatorFeedBackTime] DATETIME      NULL,
    [IsParticipantPaused]   BIT           CONSTRAINT [DF_TrainingFeedback_IsPauesed] DEFAULT ((0)) NOT NULL,
    [ParticipantPausedAt]   DATETIME      NULL,
    [StartedAt]             DATETIME      NULL,
    CONSTRAINT [PK_TranningFeedback] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TrainingFeedback_Tasks] FOREIGN KEY ([TaskId]) REFERENCES [dbo].[Tasks] ([Id]),
    CONSTRAINT [FK_TrainingFeedback_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);



















