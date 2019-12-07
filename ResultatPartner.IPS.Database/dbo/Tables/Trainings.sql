CREATE TABLE [dbo].[Trainings] (
    [Id]                          INT            IDENTITY (1, 1) NOT NULL,
    [Name]                        NVARCHAR (350) NULL,
    [What]                        NVARCHAR (MAX) NULL,
    [How]                         NVARCHAR (MAX) NULL,
    [Why]                         NVARCHAR (MAX) NULL,
    [AdditionalInfo]              NVARCHAR (MAX) NULL,
    [LevelId]                     INT            NULL,
    [Frequency]                   VARCHAR (100)  NULL,
    [Duration]                    INT            NULL,
    [DurationMetricId]            INT            NULL,
    [TypeId]                      INT            NULL,
    [IsTemplate]                  BIT            CONSTRAINT [DF_Trainings_IsTemplate] DEFAULT ((0)) NOT NULL,
    [IsActive]                    BIT            NULL,
    [OrganizationId]              INT            NULL,
    [StartDate]                   DATETIME       NULL,
    [EndDate]                     DATETIME       NULL,
    [HowMany]                     INT            NULL,
    [ExerciseMetricId]            INT            NULL,
    [HowManySets]                 INT            NULL,
    [HowManyActions]              INT            NULL,
    [UserId]                      INT            NULL,
    [IsNotificationBySMS]         BIT            CONSTRAINT [DF_Trainings_IsNotificationBySMS] DEFAULT ((0)) NOT NULL,
    [IsNotificationByEmail]       BIT            CONSTRAINT [DF_Trainings_IsNotificationByEmail] DEFAULT ((0)) NOT NULL,
    [NotificationTemplateId]      INT            NULL,
    [EmailBefore]                 INT            NULL,
    [SmsBefore]                   INT            NULL,
    [EvaluatorFeedbackRecurrence] INT            NULL,
    [CreatedBy]                   INT            NULL,
    [CreatedOn]                   DATETIME       NULL,
    [ModifiedBy]                  INT            NULL,
    [ModifiedOn]                  DATETIME       NULL,
    [CreatedAsRoleId]             NVARCHAR (128) NULL,
    [ModifiedAsRoleId]            NVARCHAR (128) NULL,
    [DescriptiveFrequency]        VARCHAR (MAX)  NULL,
    CONSTRAINT [PK_Training] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Trainings_DurationMetrics] FOREIGN KEY ([DurationMetricId]) REFERENCES [dbo].[DurationMetrics] ([Id]),
    CONSTRAINT [FK_Trainings_ExerciseMetrics] FOREIGN KEY ([ExerciseMetricId]) REFERENCES [dbo].[ExerciseMetrics] ([Id]),
    CONSTRAINT [FK_Trainings_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_Trainings_TrainingLevels] FOREIGN KEY ([LevelId]) REFERENCES [dbo].[TrainingLevels] ([Id]),
    CONSTRAINT [FK_Trainings_TrainingTypes] FOREIGN KEY ([TypeId]) REFERENCES [dbo].[TrainingTypes] ([Id]),
    CONSTRAINT [FK_Trainings_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);















