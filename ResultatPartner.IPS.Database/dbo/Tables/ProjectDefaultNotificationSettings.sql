﻿CREATE TABLE [dbo].[ProjectDefaultNotificationSettings] (
    [Id]                                        INT      IDENTITY (1, 1) NOT NULL,
    [ProjectId]                                 INT      NOT NULL,
    [ParticipantsStartNotificationId]           INT      NULL,
    [ParticipantsCompletedNotificationId]       INT      NULL,
    [ParticipantsResultNotificationId]          INT      NULL,
    [EvaluatorsStartNotificationId]             INT      NULL,
    [EvaluatorsCompletedNotificationId]         INT      NULL,
    [EvaluatorsResultNotificationId]            INT      NULL,
    [TrainersStartNotificationId]               INT      NULL,
    [TrainersCompletedNotificationId]           INT      NULL,
    [TrainersResultNotificationId]              INT      NULL,
    [ManagersStartNotificationId]               INT      NULL,
    [ManagersCompletedNotificationId]           INT      NULL,
    [ManagersResultNotificationId]              INT      NULL,
    [FinalScoreManagersStartNotificationId]     INT      NULL,
    [FinalScoreManagersCompletedNotificationId] INT      NULL,
    [FinalScoreManagersResultNotificationId]    INT      NULL,
    [ProjectManagersStartNotificationId]        INT      NULL,
    [ProjectManagersCompletedNotificationId]    INT      NULL,
    [ProjectManagersResultNotificationId]       INT      NULL,
    [ParticipantGreenNotificationId]            INT      NULL,
    [ParticipantYellowNotificationId]           INT      NULL,
    [ParticipantRedNotificationId]              INT      NULL,
    [EvaluatorGreenNotificationId]              INT      NULL,
    [EvaluatorYellowNotificationId]             INT      NULL,
    [EvaluatorRedNotificationId]                INT      NULL,
    [ManagerGreenNotificationId]                INT      NULL,
    [ManagerYellowNotificationId]               INT      NULL,
    [ManagerRedNotificationId]                  INT      NULL,
    [TrainerGreenNotificationId]                INT      NULL,
    [TrainerYellowNotificationId]               INT      NULL,
    [TrainerRedNotificationId]                  INT      NULL,
    [FinalScoreManagersGreenNotificationId]     INT      NULL,
    [FinalScoreManagersYellowNotificationId]    INT      NULL,
    [FinalScoreManagersRedNotificationId]       INT      NULL,
    [ProjectManagersGreenNotificationId]        INT      NULL,
    [ProjectManagersYellowNotificationId]       INT      NULL,
    [ProjectManagersRedNotificationId]          INT      NULL,
    [GreenAlarmBefore]                          INT      NULL,
    [YellowAlarmBefore]                         INT      NULL,
    [RedAlarmBefore]                            INT      NULL,
    [EmailNotification]                         BIT      NOT NULL,
    [SmsNotification]                           BIT      NOT NULL,
    [CreatedOn]                                 DATETIME NULL,
    [CreatedBy]                                 INT      NULL,
    [ModifiedOn]                                DATETIME NULL,
    [ModifiedBy]                                INT      NULL,
    CONSTRAINT [PK_ProjectNotificationDefaultSettings] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProjectNotificationDefaultSettings_Projects] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id])
);
