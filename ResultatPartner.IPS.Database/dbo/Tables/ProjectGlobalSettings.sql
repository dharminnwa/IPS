﻿CREATE TABLE [dbo].[ProjectGlobalSettings] (
    [Id]                                                                      INT            IDENTITY (1, 1) NOT NULL,
    [ProjectId]                                                               INT            NOT NULL,
    [SoftProfileActualTimeSpan]                                               BIGINT         NULL,
    [SoftProfileMonthSpan]                                                    INT            NOT NULL,
    [SoftProfileWeekSpan]                                                     INT            NOT NULL,
    [SoftProfileDaySpan]                                                      INT            NOT NULL,
    [SoftProfileHourSpan]                                                     INT            NOT NULL,
    [SoftProfileMinuteSpan]                                                   INT            NOT NULL,
    [KnowledgeProfileActualTimeSpan]                                          BIGINT         NULL,
    [KnowledgeProfileMonthSpan]                                               INT            NOT NULL,
    [KnowledgeProfileWeekSpan]                                                INT            NOT NULL,
    [KnowledgeProfileDaySpan]                                                 INT            NOT NULL,
    [KnowledgeProfileHourSpan]                                                INT            NOT NULL,
    [KnowledgeProfileMinuteSpan]                                              INT            NOT NULL,
    [SoftProfileStartExternalStartNotificationTemplateId]                     INT            NULL,
    [KnowledgeProfileExternalStartNotificationTemplateId]                     INT            NULL,
    [KnowledgeProfileEvaluatorStartNotificationTemplateId]                    INT            NULL,
    [KnowledgeProfileTrainerStartNotificationTemplateId]                      INT            NULL,
    [KnowledgeProfileManagerStartNotificationTemplateId]                      INT            NULL,
    [KnowledgeProfileExternalCompletedNotificationTemplateId]                 INT            NULL,
    [KnowledgeProfileEvaluatorCompletedNotificationTemplateId]                INT            NULL,
    [KnowledgeProfileTrainerCompletedNotificationTemplateId]                  INT            NULL,
    [KnowledgeProfileManagerCompletedNotificationTemplateId]                  INT            NULL,
    [KnowledgeProfileExternalResultsNotificationTemplateId]                   INT            NULL,
    [KnowledgeProfileEvaluatorResultsNotificationTemplateId]                  INT            NULL,
    [KnowledgeProfileTrainerResultsNotificationTemplateId]                    INT            NULL,
    [KnowledgeProfileManagerResultsNotificationTemplateId]                    INT            NULL,
    [KnowledgeProfileGreenAlarmParticipantTemplateId]                         INT            NULL,
    [KnowledgeProfileGreenAlarmEvaluatorTemplateId]                           INT            NULL,
    [KnowledgeProfileGreenAlarmManagerTemplateId]                             INT            NULL,
    [KnowledgeProfileGreenAlarmTrainerTemplateId]                             INT            NULL,
    [KnowledgeProfileYellowAlarmParticipantTemplateId]                        INT            NULL,
    [KnowledgeProfileYellowAlarmEvaluatorTemplateId]                          INT            NULL,
    [KnowledgeProfileYellowAlarmManagerTemplateId]                            INT            NULL,
    [KnowledgeProfileYellowAlarmTrainerTemplateId]                            INT            NULL,
    [KnowledgeProfileRedAlarmParticipantTemplateId]                           INT            NULL,
    [KnowledgeProfileRedAlarmEvaluatorTemplateId]                             INT            NULL,
    [KnowledgeProfileRedAlarmManagerTemplateId]                               INT            NULL,
    [KnowledgeProfileRedAlarmTrainerTemplateId]                               INT            NULL,
    [SoftProfileRecurrentTrainingTimeSpan]                                    NVARCHAR (500) NULL,
    [KnowledgeProfileRecurrentTrainingTimeSpan]                               NVARCHAR (500) NULL,
    [SoftProfileStartEvaluatorStartNotificationTemplateId]                    INT            NULL,
    [SoftProfileStartTrainerStartNotificationTemplateId]                      INT            NULL,
    [SoftProfileStartManagerStartNotificationTemplateId]                      INT            NULL,
    [SoftProfileStartExternalCompletedNotificationTemplateId]                 INT            NULL,
    [SoftProfileStartEvaluatorCompletedNotificationTemplateId]                INT            NULL,
    [SoftProfileStartTrainerCompletedNotificationTemplateId]                  INT            NULL,
    [SoftProfileStartManagerCompletedNotificationTemplateId]                  INT            NULL,
    [SoftProfileStartExternalResultsNotificationTemplateId]                   INT            NULL,
    [SoftProfileStartEvaluatorResultsNotificationTemplateId]                  INT            NULL,
    [SoftProfileStartTrainerResultsNotificationTemplateId]                    INT            NULL,
    [SoftProfileStartManagerResultsNotificationTemplateId]                    INT            NULL,
    [SoftProfileStartGreenAlarmParticipantTemplateId]                         INT            NULL,
    [SoftProfileStartGreenAlarmEvaluatorTemplateId]                           INT            NULL,
    [SoftProfileStartGreenAlarmManagerTemplateId]                             INT            NULL,
    [SoftProfileStartGreenAlarmTrainerTemplateId]                             INT            NULL,
    [SoftProfileStartYellowAlarmParticipantTemplateId]                        INT            NULL,
    [SoftProfileStartYellowAlarmEvaluatorTemplateId]                          INT            NULL,
    [SoftProfileStartYellowAlarmManagerTemplateId]                            INT            NULL,
    [SoftProfileStartYellowAlarmTrainerTemplateId]                            INT            NULL,
    [SoftProfileStartRedAlarmParticipantTemplateId]                           INT            NULL,
    [SoftProfileStartRedAlarmEvaluatorTemplateId]                             INT            NULL,
    [SoftProfileStartRedAlarmManagerTemplateId]                               INT            NULL,
    [SoftProfileStartRedAlarmTrainerTemplateId]                               INT            NULL,
    [SoftProfileShortGoalExternalStartNotificationTemplateId]                 INT            NULL,
    [SoftProfileShortGoalEvaluatorStartNotificationTemplateId]                INT            NULL,
    [SoftProfileShortGoalTrainerStartNotificationTemplateId]                  INT            NULL,
    [SoftProfileShortGoalManagerStartNotificationTemplateId]                  INT            NULL,
    [SoftProfileShortGoalExternalCompletedNotificationTemplateId]             INT            NULL,
    [SoftProfileShortGoalEvaluatorCompletedNotificationTemplateId]            INT            NULL,
    [SoftProfileShortGoalTrainerCompletedNotificationTemplateId]              INT            NULL,
    [SoftProfileShortGoalManagerCompletedNotificationTemplateId]              INT            NULL,
    [SoftProfileShortGoalExternalResultsNotificationTemplateId]               INT            NULL,
    [SoftProfileShortGoalEvaluatorResultsNotificationTemplateId]              INT            NULL,
    [SoftProfileShortGoalTrainerResultsNotificationTemplateId]                INT            NULL,
    [SoftProfileShortGoalManagerResultsNotificationTemplateId]                INT            NULL,
    [SoftProfileShortGoalGreenAlarmParticipantTemplateId]                     INT            NULL,
    [SoftProfileShortGoalGreenAlarmEvaluatorTemplateId]                       INT            NULL,
    [SoftProfileShortGoalGreenAlarmManagerTemplateId]                         INT            NULL,
    [SoftProfileShortGoalGreenAlarmTrainerTemplateId]                         INT            NULL,
    [SoftProfileShortGoalYellowAlarmParticipantTemplateId]                    INT            NULL,
    [SoftProfileShortGoalYellowAlarmEvaluatorTemplateId]                      INT            NULL,
    [SoftProfileShortGoalYellowAlarmManagerTemplateId]                        INT            NULL,
    [SoftProfileShortGoalYellowAlarmTrainerTemplateId]                        INT            NULL,
    [SoftProfileShortGoalRedAlarmParticipantTemplateId]                       INT            NULL,
    [SoftProfileShortGoalRedAlarmEvaluatorTemplateId]                         INT            NULL,
    [SoftProfileShortGoalRedAlarmManagerTemplateId]                           INT            NULL,
    [SoftProfileShortGoalRedAlarmTrainerTemplateId]                           INT            NULL,
    [SoftProfileMidGoalExternalStartNotificationTemplateId]                   INT            NULL,
    [SoftProfileMidGoalEvaluatorStartNotificationTemplateId]                  INT            NULL,
    [SoftProfileMidGoalTrainerStartNotificationTemplateId]                    INT            NULL,
    [SoftProfileMidGoalManagerStartNotificationTemplateId]                    INT            NULL,
    [SoftProfileMidGoalExternalCompletedNotificationTemplateId]               INT            NULL,
    [SoftProfileMidGoalEvaluatorCompletedNotificationTemplateId]              INT            NULL,
    [SoftProfileMidGoalTrainerCompletedNotificationTemplateId]                INT            NULL,
    [SoftProfileMidGoalManagerCompletedNotificationTemplateId]                INT            NULL,
    [SoftProfileMidGoalExternalResultsNotificationTemplateId]                 INT            NULL,
    [SoftProfileMidGoalEvaluatorResultsNotificationTemplateId]                INT            NULL,
    [SoftProfileMidGoalTrainerResultsNotificationTemplateId]                  INT            NULL,
    [SoftProfileMidGoalManagerResultsNotificationTemplateId]                  INT            NULL,
    [SoftProfileMidGoalGreenAlarmParticipantTemplateId]                       INT            NULL,
    [SoftProfileMidGoalGreenAlarmEvaluatorTemplateId]                         INT            NULL,
    [SoftProfileMidGoalGreenAlarmManagerTemplateId]                           INT            NULL,
    [SoftProfileMidGoalGreenAlarmTrainerTemplateId]                           INT            NULL,
    [SoftProfileMidGoalYellowAlarmParticipantTemplateId]                      INT            NULL,
    [SoftProfileMidGoalYellowAlarmEvaluatorTemplateId]                        INT            NULL,
    [SoftProfileMidGoalYellowAlarmManagerTemplateId]                          INT            NULL,
    [SoftProfileMidGoalYellowAlarmTrainerTemplateId]                          INT            NULL,
    [SoftProfileMidGoalRedAlarmParticipantTemplateId]                         INT            NULL,
    [SoftProfileMidGoalRedAlarmEvaluatorTemplateId]                           INT            NULL,
    [SoftProfileMidGoalRedAlarmManagerTemplateId]                             INT            NULL,
    [SoftProfileMidGoalRedAlarmTrainerTemplateId]                             INT            NULL,
    [SoftProfileLongTermGoalExternalStartNotificationTemplateId]              INT            NULL,
    [SoftProfileLongTermGoalEvaluatorStartNotificationTemplateId]             INT            NULL,
    [SoftProfileLongTermGoalTrainerStartNotificationTemplateId]               INT            NULL,
    [SoftProfileLongTermGoalManagerStartNotificationTemplateId]               INT            NULL,
    [SoftProfileLongTermGoalExternalCompletedNotificationTemplateId]          INT            NULL,
    [SoftProfileLongTermGoalEvaluatorCompletedNotificationTemplateId]         INT            NULL,
    [SoftProfileLongTermGoalTrainerCompletedNotificationTemplateId]           INT            NULL,
    [SoftProfileLongTermGoalManagerCompletedNotificationTemplateId]           INT            NULL,
    [SoftProfileLongTermGoalExternalResultsNotificationTemplateId]            INT            NULL,
    [SoftProfileLongTermGoalEvaluatorResultsNotificationTemplateId]           INT            NULL,
    [SoftProfileLongTermGoalTrainerResultsNotificationTemplateId]             INT            NULL,
    [SoftProfileLongTermGoalManagerResultsNotificationTemplateId]             INT            NULL,
    [SoftProfileLongTermGoalGreenAlarmParticipantTemplateId]                  INT            NULL,
    [SoftProfileLongTermGoalGreenAlarmEvaluatorTemplateId]                    INT            NULL,
    [SoftProfileLongTermGoalGreenAlarmManagerTemplateId]                      INT            NULL,
    [SoftProfileLongTermGoalGreenAlarmTrainerTemplateId]                      INT            NULL,
    [SoftProfileLongTermGoalYellowAlarmParticipantTemplateId]                 INT            NULL,
    [SoftProfileLongTermGoalYellowAlarmEvaluatorTemplateId]                   INT            NULL,
    [SoftProfileLongTermGoalYellowAlarmManagerTemplateId]                     INT            NULL,
    [SoftProfileLongTermGoalYellowAlarmTrainerTemplateId]                     INT            NULL,
    [SoftProfileLongTermGoalRedAlarmParticipantTemplateId]                    INT            NULL,
    [SoftProfileLongTermGoalRedAlarmEvaluatorTemplateId]                      INT            NULL,
    [SoftProfileLongTermGoalRedAlarmManagerTemplateId]                        INT            NULL,
    [SoftProfileLongTermGoalRedAlarmTrainerTemplateId]                        INT            NULL,
    [SoftProfileFinalGoalExternalStartNotificationTemplateId]                 INT            NULL,
    [SoftProfileFinalGoalEvaluatorStartNotificationTemplateId]                INT            NULL,
    [SoftProfileFinalGoalTrainerStartNotificationTemplateId]                  INT            NULL,
    [SoftProfileFinalGoalManagerStartNotificationTemplateId]                  INT            NULL,
    [SoftProfileFinalGoalExternalCompletedNotificationTemplateId]             INT            NULL,
    [SoftProfileFinalGoalEvaluatorCompletedNotificationTemplateId]            INT            NULL,
    [SoftProfileFinalGoalTrainerCompletedNotificationTemplateId]              INT            NULL,
    [SoftProfileFinalGoalManagerCompletedNotificationTemplateId]              INT            NULL,
    [SoftProfileFinalGoalExternalResultsNotificationTemplateId]               INT            NULL,
    [SoftProfileFinalGoalEvaluatorResultsNotificationTemplateId]              INT            NULL,
    [SoftProfileFinalGoalTrainerResultsNotificationTemplateId]                INT            NULL,
    [SoftProfileFinalGoalManagerResultsNotificationTemplateId]                INT            NULL,
    [SoftProfileFinalGoalGreenAlarmParticipantTemplateId]                     INT            NULL,
    [SoftProfileFinalGoalGreenAlarmEvaluatorTemplateId]                       INT            NULL,
    [SoftProfileFinalGoalGreenAlarmManagerTemplateId]                         INT            NULL,
    [SoftProfileFinalGoalGreenAlarmTrainerTemplateId]                         INT            NULL,
    [SoftProfileFinalGoalYellowAlarmParticipantTemplateId]                    INT            NULL,
    [SoftProfileFinalGoalYellowAlarmEvaluatorTemplateId]                      INT            NULL,
    [SoftProfileFinalGoalYellowAlarmManagerTemplateId]                        INT            NULL,
    [SoftProfileFinalGoalYellowAlarmTrainerTemplateId]                        INT            NULL,
    [SoftProfileFinalGoalRedAlarmParticipantTemplateId]                       INT            NULL,
    [SoftProfileFinalGoalRedAlarmEvaluatorTemplateId]                         INT            NULL,
    [SoftProfileFinalGoalRedAlarmManagerTemplateId]                           INT            NULL,
    [SoftProfileFinalGoalRedAlarmTrainerTemplateId]                           INT            NULL,
    [SoftProfileStartEmailNotification]                                       BIT            CONSTRAINT [DF__ProjectGl__softP__2902ECC1] DEFAULT ((0)) NOT NULL,
    [SoftProfileStartSmsNotification]                                         BIT            CONSTRAINT [DF__ProjectGl__softP__29F710FA] DEFAULT ((0)) NOT NULL,
    [SoftProfileShortGoalEmailNotification]                                   BIT            CONSTRAINT [DF__ProjectGl__softP__2AEB3533] DEFAULT ((0)) NOT NULL,
    [SoftProfileShortGoalSmsNotification]                                     BIT            CONSTRAINT [DF__ProjectGl__softP__2BDF596C] DEFAULT ((0)) NOT NULL,
    [SoftProfileMidGoalEmailNotification]                                     BIT            CONSTRAINT [DF__ProjectGl__softP__2CD37DA5] DEFAULT ((0)) NOT NULL,
    [SoftProfileMidGoalSmsNotification]                                       BIT            CONSTRAINT [DF__ProjectGl__softP__2DC7A1DE] DEFAULT ((0)) NOT NULL,
    [SoftProfileLongTermGoalEmailNotification]                                BIT            CONSTRAINT [DF__ProjectGl__softP__2EBBC617] DEFAULT ((0)) NOT NULL,
    [SoftProfileLongTermGoalSmsNotification]                                  BIT            CONSTRAINT [DF__ProjectGl__softP__2FAFEA50] DEFAULT ((0)) NOT NULL,
    [SoftProfileFinalTermGoalEmailNotification]                               BIT            CONSTRAINT [DF__ProjectGl__softP__30A40E89] DEFAULT ((0)) NOT NULL,
    [SoftProfileFinalTermGoalSmsNotification]                                 BIT            CONSTRAINT [DF__ProjectGl__softP__319832C2] DEFAULT ((0)) NOT NULL,
    [KnowledgeProfileEmailNotification]                                       BIT            CONSTRAINT [DF__ProjectGl__knowl__328C56FB] DEFAULT ((0)) NOT NULL,
    [KnowledgeProfileSmsNotification]                                         BIT            CONSTRAINT [DF__ProjectGl__knowl__33807B34] DEFAULT ((0)) NOT NULL,
    [SoftProfileHowMany]                                                      INT            NULL,
    [SoftProfileMetricId]                                                     INT            NULL,
    [SoftProfileHowManySets]                                                  INT            NULL,
    [SoftProfileHowManyActions]                                               INT            NULL,
    [KnowledgeProfileHowMany]                                                 INT            NULL,
    [KnowledgeProfileMetricId]                                                INT            NULL,
    [KnowledgeProfileHowManySets]                                             INT            NULL,
    [KnowledgeProfileHowManyActions]                                          INT            NULL,
    [SoftProfilePersonalTrainingReminderNotificationTemplateId]               INT            NULL,
    [SoftProfileProfileTrainingReminderNotificationTemplateId]                INT            NULL,
    [KnowledgeProfilePersonalTrainingReminderNotificationTemplateId]          INT            NULL,
    [KnowledgeProfileProfileTrainingReminderNotificationTemplateId]           INT            NULL,
    [StartStageStartDate]                                                     DATETIME       NULL,
    [StartStageEndDate]                                                       DATETIME       NULL,
    [ShortGoalStartDate]                                                      DATETIME       NULL,
    [ShortGoalEndDate]                                                        DATETIME       NULL,
    [MidGoalStartDate]                                                        DATETIME       NULL,
    [MidGoalEndDate]                                                          DATETIME       NULL,
    [LongTermGoalStartDate]                                                   DATETIME       NULL,
    [LongTermGoalEndDate]                                                     DATETIME       NULL,
    [FinalGoalStartDate]                                                      DATETIME       NULL,
    [FinalGoalEndDate]                                                        DATETIME       NULL,
    [KnowledgeProfileStartDate]                                               DATETIME       NULL,
    [KnowledgeProfileEndDate]                                                 DATETIME       NULL,
    [TrainerId]                                                               INT            NULL,
    [ManagerId]                                                               INT            NULL,
    [SoftProfileStartGreenAlarmTime]                                          DATETIME       NULL,
    [SoftProfileStartYellowAlarmTime]                                         DATETIME       NULL,
    [SoftProfileStartRedAlarmTime]                                            DATETIME       NULL,
    [SoftProfileShortGoalGreenAlarmTime]                                      DATETIME       NULL,
    [SoftProfileShortGoalYellowAlarmTime]                                     DATETIME       NULL,
    [SoftProfileShortGoalRedAlarmTime]                                        DATETIME       NULL,
    [SoftProfileMidGoalGreenAlarmTime]                                        DATETIME       NULL,
    [SoftProfileMidGoalYellowAlarmTime]                                       DATETIME       NULL,
    [SoftProfileMidGoalRedAlarmTime]                                          DATETIME       NULL,
    [SoftProfileLongTermGoalGreenAlarmTime]                                   DATETIME       NULL,
    [SoftProfileLongTermGoalYellowAlarmTime]                                  DATETIME       NULL,
    [SoftProfileLongTermGoalRedAlarmTime]                                     DATETIME       NULL,
    [SoftProfileFinalGoalGreenAlarmTime]                                      DATETIME       NULL,
    [SoftProfileFinalGoalYellowAlarmTime]                                     DATETIME       NULL,
    [SoftProfileFinalGoalRedAlarmTime]                                        DATETIME       NULL,
    [KnowledgeProfileGreenAlarmTime]                                          DATETIME       NULL,
    [KnowledgeProfileYellowAlarmTime]                                         DATETIME       NULL,
    [KnowledgeProfileRedAlarmTime]                                            DATETIME       NULL,
    [KnowledgeProfileProjectManagerStartNotificationTemplateId]               INT            NULL,
    [KnowledgeProfileFinalScoreManagerStartNotificationTemplateId]            INT            NULL,
    [KnowledgeProfileProjectManagerCompletedNotificationTemplateId]           INT            NULL,
    [KnowledgeProfileFinalScoreManagerCompletedNotificationTemplateId]        INT            NULL,
    [KnowledgeProfileProjectManagerResultsNotificationTemplateId]             INT            NULL,
    [KnowledgeProfileFinalScoreManagerResultsNotificationTemplateId]          INT            NULL,
    [KnowledgeProfileGreenAlarmProjectManagerTemplateId]                      INT            NULL,
    [KnowledgeProfileGreenAlarmFinalScoreManagerTemplateId]                   INT            NULL,
    [KnowledgeProfileYellowAlarmProjectManagerTemplateId]                     INT            NULL,
    [KnowledgeProfileYellowAlarmFinalScoreManagerTemplateId]                  INT            NULL,
    [KnowledgeProfileRedAlarmProjectManagerTemplateId]                        INT            NULL,
    [KnowledgeProfileRedAlarmFinalScoreManagerTemplateId]                     INT            NULL,
    [SoftProfileStartProjectManagerStartNotificationTemplateId]               INT            NULL,
    [SoftProfileStartFinalScoreManagerStartNotificationTemplateId]            INT            NULL,
    [SoftProfileStartProjectManagerCompletedNotificationTemplateId]           INT            NULL,
    [SoftProfileStartFinalScoreManagerCompletedNotificationTemplateId]        INT            NULL,
    [SoftProfileStartProjectManagerResultsNotificationTemplateId]             INT            NULL,
    [SoftProfileStartFinalScoreManagerResultsNotificationTemplateId]          INT            NULL,
    [SoftProfileStartGreenAlarmProjectManagerTemplateId]                      INT            NULL,
    [SoftProfileStartGreenAlarmFinalScoreManagerTemplateId]                   INT            NULL,
    [SoftProfileStartYellowAlarmProjectManagerTemplateId]                     INT            NULL,
    [SoftProfileStartYellowAlarmFinalScoreManagerTemplateId]                  INT            NULL,
    [SoftProfileStartRedAlarmProjectManagerTemplateId]                        INT            NULL,
    [SoftProfileStartRedAlarmFinalScoreManagerTemplateId]                     INT            NULL,
    [SoftProfileShortGoalProjectManagerStartNotificationTemplateId]           INT            NULL,
    [SoftProfileShortGoalFinalScoreManagerStartNotificationTemplateId]        INT            NULL,
    [SoftProfileShortGoalProjectManagerCompletedNotificationTemplateId]       INT            NULL,
    [SoftProfileShortGoalFinalScoreManagerCompletedNotificationTemplateId]    INT            NULL,
    [SoftProfileShortGoalProjectManagerResultsNotificationTemplateId]         INT            NULL,
    [SoftProfileShortGoalFinalScoreManagerResultsNotificationTemplateId]      INT            NULL,
    [SoftProfileShortGoalGreenAlarmProjectManagerTemplateId]                  INT            NULL,
    [SoftProfileShortGoalGreenAlarmFinalScoreManagerTemplateId]               INT            NULL,
    [SoftProfileShortGoalYellowAlarmProjectManagerTemplateId]                 INT            NULL,
    [SoftProfileShortGoalYellowAlarmFinalScoreManagerTemplateId]              INT            NULL,
    [SoftProfileShortGoalRedAlarmProjectManagerTemplateId]                    INT            NULL,
    [SoftProfileShortGoalRedAlarmFinalScoreManagerTemplateId]                 INT            NULL,
    [SoftProfileMidGoalProjectManagerStartNotificationTemplateId]             INT            NULL,
    [SoftProfileMidGoalFinalScoreManagerStartNotificationTemplateId]          INT            NULL,
    [SoftProfileMidGoalProjectManagerCompletedNotificationTemplateId]         INT            NULL,
    [SoftProfileMidGoalFinalScoreManagerCompletedNotificationTemplateId]      INT            NULL,
    [SoftProfileMidGoalProjectManagerResultsNotificationTemplateId]           INT            NULL,
    [SoftProfileMidGoalFinalScoreManagerResultsNotificationTemplateId]        INT            NULL,
    [SoftProfileMidGoalGreenAlarmProjectManagerTemplateId]                    INT            NULL,
    [SoftProfileMidGoalGreenAlarmFinalScoreManagerTemplateId]                 INT            NULL,
    [SoftProfileMidGoalYellowAlarmProjectManagerTemplateId]                   INT            NULL,
    [SoftProfileMidGoalYellowAlarmFinalScoreManagerTemplateId]                INT            NULL,
    [SoftProfileMidGoalRedAlarmProjectManagerTemplateId]                      INT            NULL,
    [SoftProfileMidGoalRedAlarmFinalScoreManagerTemplateId]                   INT            NULL,
    [SoftProfileLongTermGoalProjectManagerStartNotificationTemplateId]        INT            NULL,
    [SoftProfileLongTermGoalFinalScoreManagerStartNotificationTemplateId]     INT            NULL,
    [SoftProfileLongTermGoalProjectManagerCompletedNotificationTemplateId]    INT            NULL,
    [SoftProfileLongTermGoalFinalScoreManagerCompletedNotificationTemplateId] INT            NULL,
    [SoftProfileLongTermGoalProjectManagerResultsNotificationTemplateId]      INT            NULL,
    [SoftProfileLongTermGoalFinalScoreManagerResultsNotificationTemplateId]   INT            NULL,
    [SoftProfileLongTermGoalGreenAlarmProjectManagerTemplateId]               INT            NULL,
    [SoftProfileLongTermGoalGreenAlarmFinalScoreManagerTemplateId]            INT            NULL,
    [SoftProfileLongTermGoalYellowAlarmProjectManagerTemplateId]              INT            NULL,
    [SoftProfileLongTermGoalYellowAlarmFinalScoreManagerTemplateId]           INT            NULL,
    [SoftProfileLongTermGoalRedAlarmProjectManagerTemplateId]                 INT            NULL,
    [SoftProfileLongTermGoalRedAlarmFinalScoreManagerTemplateId]              INT            NULL,
    [SoftProfileFinalGoalProjectManagerStartNotificationTemplateId]           INT            NULL,
    [SoftProfileFinalGoalFinalScoreManagerStartNotificationTemplateId]        INT            NULL,
    [SoftProfileFinalGoalProjectManagerCompletedNotificationTemplateId]       INT            NULL,
    [SoftProfileFinalGoalFinalScoreManagerCompletedNotificationTemplateId]    INT            NULL,
    [SoftProfileFinalGoalProjectManagerResultsNotificationTemplateId]         INT            NULL,
    [SoftProfileFinalGoalFinalScoreManagerResultsNotificationTemplateId]      INT            NULL,
    [SoftProfileFinalGoalGreenAlarmProjectManagerTemplateId]                  INT            NULL,
    [SoftProfileFinalGoalGreenAlarmFinalScoreManagerTemplateId]               INT            NULL,
    [SoftProfileFinalGoalYellowAlarmProjectManagerTemplateId]                 INT            NULL,
    [SoftProfileFinalGoalYellowAlarmFinalScoreManagerTemplateId]              INT            NULL,
    [SoftProfileFinalGoalRedAlarmProjectManagerTemplateId]                    INT            NULL,
    [SoftProfileFinalGoalRedAlarmFinalScoreManagerTemplateId]                 INT            NULL,
    CONSTRAINT [PK_ProjectGlobalSettings] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProjectGlobalSettings_ProjectGlobalSettings] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id])
);















