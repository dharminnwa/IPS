﻿CREATE TABLE [dbo].[UserRecurrentNotificationSetting] (
    [Id]                                               INT           IDENTITY (1, 1) NOT NULL,
    [StageGroupId]                                     INT           NOT NULL,
    [StageId]                                          INT           NULL,
    [UserId]                                           INT           NULL,
    [EmailNotification]                                BIT           NOT NULL,
    [SMSNotification]                                  BIT           NOT NULL,
    [GreenAlarmParticipantTemplateId]                  INT           NULL,
    [GreenAlarmTime]                                   INT           NULL,
    [YellowAlarmParticipantTemplateId]                 INT           NULL,
    [YellowAlarmTime]                                  INT           NULL,
    [RedAlarmParticipantTemplateId]                    INT           NULL,
    [RedAlarmTime]                                     INT           NULL,
    [ExternalStartNotificationTemplateId]              INT           NULL,
    [ExternalCompletedNotificationTemplateId]          INT           NULL,
    [ExternalResultsNotificationTemplateId]            INT           NULL,
    [EvaluatorStartNotificationTemplateId]             INT           NULL,
    [EvaluatorCompletedNotificationTemplateId]         INT           NULL,
    [EvaluatorResultsNotificationTemplateId]           INT           NULL,
    [TrainerStartNotificationTemplateId]               INT           NULL,
    [TrainerCompletedNotificationTemplateId]           INT           NULL,
    [TrainerResultsNotificationTemplateId]             INT           NULL,
    [ManagerStartNotificationTemplateId]               INT           NULL,
    [ManagerCompletedNotificationTemplateId]           INT           NULL,
    [ManagerResultsNotificationTemplateId]             INT           NULL,
    [ManagerId]                                        INT           NULL,
    [TrainerId]                                        INT           NULL,
    [InvitedAt]                                        DATETIME      NULL,
    [GreenAlarmEvaluatorTemplateId]                    INT           NULL,
    [GreenAlarmManagerTemplateId]                      INT           NULL,
    [GreenAlarmTrainerTemplateId]                      INT           NULL,
    [YellowAlarmEvaluatorTemplateId]                   INT           NULL,
    [YellowAlarmManagerTemplateId]                     INT           NULL,
    [YellowAlarmTrainerTemplateId]                     INT           NULL,
    [RedAlarmEvaluatorTemplateId]                      INT           NULL,
    [RedAlarmManagerTemplateId]                        INT           NULL,
    [RedAlarmTrainerTemplateId]                        INT           NULL,
    [RecurrentTrainningFrequency]                      VARCHAR (500) NULL,
    [HowMany]                                          INT           NULL,
    [MetricId]                                         INT           NULL,
    [HowManyActions]                                   INT           NULL,
    [HowManySet]                                       INT           NULL,
    [PersonalTrainingReminderNotificationTemplateId]   INT           NULL,
    [ProfileTrainingReminderNotificationTemplateId]    INT           NULL,
    [CreatedAt]                                        DATETIME      NULL,
    [CreatedBy]                                        INT           NULL,
    [ModifiedAt]                                       DATETIME      NULL,
    [ModifiedBy]                                       INT           NULL,
    [ProjectManagerStartNotificationTemplateId]        INT           NULL,
    [ProjectManagerCompletedNotificationTemplateId]    INT           NULL,
    [ProjectManagerResultsNotificationTemplateId]      INT           NULL,
    [FinalScoreManagerStartNotificationTemplateId]     INT           NULL,
    [FinalScoreManagerCompletedNotificationTemplateId] INT           NULL,
    [FinalScoreManagerResultsNotificationTemplateId]   INT           NULL,
    [GreenAlarmProjectManagerTemplateId]               INT           NULL,
    [YellowAlarmProjectManagerTemplateId]              INT           NULL,
    [RedAlarmProjectManagerTemplateId]                 INT           NULL,
    [GreenAlarmFinalScoreManagerTemplateId]            INT           NULL,
    [YellowAlarmFinalScoreManagerTemplateId]           INT           NULL,
    [RedAlarmFinalScoreManagerTemplateId]              INT           NULL,
    CONSTRAINT [PK_UserRecurrentNotificationSetting] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_EvaluatorCompletedNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([EvaluatorCompletedNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_EvaluatorResultsNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([EvaluatorResultsNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_EvaluatorStartNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([EvaluatorStartNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_ExternalCompletedNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([ExternalCompletedNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_ExternalResultsNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([ExternalResultsNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_ExternalStartNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([ExternalStartNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_GreenAlarmEvaluatorTemplateId_NotificationTemplates] FOREIGN KEY ([GreenAlarmEvaluatorTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_GreenAlarmManagerTemplateId_NotificationTemplates] FOREIGN KEY ([GreenAlarmManagerTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_GreenAlarmParticipantTemplateId_NotificationTemplates] FOREIGN KEY ([GreenAlarmParticipantTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_GreenAlarmTrainerTemplateId_NotificationTemplates] FOREIGN KEY ([GreenAlarmTrainerTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_ManagerCompletedNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([ManagerCompletedNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_ManagerId_Users] FOREIGN KEY ([ManagerId]) REFERENCES [dbo].[Users] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_ManagerResultsNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([ManagerResultsNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_ManagerStartNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([ManagerStartNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_NotificationTemplates] FOREIGN KEY ([PersonalTrainingReminderNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_NotificationTemplates1] FOREIGN KEY ([ProfileTrainingReminderNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_RedAlarmEvaluatorTemplateId_NotificationTemplates] FOREIGN KEY ([RedAlarmEvaluatorTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_RedAlarmManagerTemplateId_NotificationTemplates] FOREIGN KEY ([RedAlarmManagerTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_RedAlarmParticipantTemplateId_NotificationTemplates] FOREIGN KEY ([RedAlarmParticipantTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_RedAlarmTrainerTemplateId_NotificationTemplates] FOREIGN KEY ([RedAlarmTrainerTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_StageGroups] FOREIGN KEY ([StageGroupId]) REFERENCES [dbo].[StageGroups] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_TrainerCompletedNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([TrainerCompletedNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_TrainerId_Users] FOREIGN KEY ([TrainerId]) REFERENCES [dbo].[Users] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_TrainerResultsNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([TrainerResultsNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_TrainerStartNotificationTemplateId_NotificationTemplates] FOREIGN KEY ([TrainerStartNotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_YellowAlarmEvaluatorTemplateId_NotificationTemplates] FOREIGN KEY ([YellowAlarmEvaluatorTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_YellowAlarmManagerTemplateId_NotificationTemplates] FOREIGN KEY ([YellowAlarmManagerTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_YellowAlarmParticipantTemplateId_NotificationTemplates] FOREIGN KEY ([YellowAlarmParticipantTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_UserRecurrentNotificationSetting_YellowAlarmTrainerTemplateId_NotificationTemplates] FOREIGN KEY ([YellowAlarmTrainerTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id])
);



