/*****************************************/
/***** Update Script *********************/
/*****************************************/


/***** [ 06/10/2015] ************************/

/*CREATE Projects---------------------------------------------------------------------------------------------------------------------*/
CREATE TABLE [dbo].[Projects](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
	[Summary] [nvarchar](max) NULL,
	[VisionStatement] [nvarchar](max) NULL,
	[IsActive] [bit] NOT NULL,
	[ExpectedStartDate] [datetime] NOT NULL,
	[ExpectedEndDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Projects] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/* CREATE ProjectRoles ---------------------------------------------------------------------------------------------------------------*/

CREATE TABLE [dbo].[ProjectRoles](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
	[Description] [nvarchar](max) NULL,
 CONSTRAINT [PK_ProjectRoles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/* CREATE Link_ProjectUsers -----------------------------------------------------------------------------------------------------------*/

CREATE TABLE [dbo].[Link_ProjectUsers](
	[ProjectId] [int] NOT NULL,
	[UserId] [int] NOT NULL,
	[RoleId] [int] NOT NULL,
 CONSTRAINT [PK_Link_ProjectUsers] PRIMARY KEY CLUSTERED 
(
	[ProjectId] ASC,
	[UserId] ASC,
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
ALTER TABLE [dbo].[Link_ProjectUsers]  WITH CHECK ADD  CONSTRAINT [FK_Link_ProjectUsers_ProjectRoles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[ProjectRoles] ([Id])

GO
ALTER TABLE [dbo].[Link_ProjectUsers] CHECK CONSTRAINT [FK_Link_ProjectUsers_ProjectRoles]

GO
ALTER TABLE [dbo].[Link_ProjectUsers]  WITH CHECK ADD  CONSTRAINT [FK_Link_ProjectUsers_Projects] FOREIGN KEY([ProjectId])
REFERENCES [dbo].[Projects] ([Id])

GO
ALTER TABLE [dbo].[Link_ProjectUsers] CHECK CONSTRAINT [FK_Link_ProjectUsers_Projects]

GO
ALTER TABLE [dbo].[Link_ProjectUsers]  WITH CHECK ADD  CONSTRAINT [FK_Link_ProjectUsers_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])

GO
ALTER TABLE [dbo].[Link_ProjectUsers] CHECK CONSTRAINT [FK_Link_ProjectUsers_Users]
GO

/* ALTER Departments-----------------------------------------------------------------------------------------------------------------*/
ALTER TABLE [dbo].[Departments] 
ADD [ParentId] [int]
GO

ALTER TABLE [dbo].[Departments]  WITH CHECK ADD  CONSTRAINT [FK_Departments_Departments] FOREIGN KEY([ParentId])
REFERENCES [dbo].[Departments] ([Id])
GO
ALTER TABLE [dbo].[Departments] CHECK CONSTRAINT [FK_Departments_Departments]
GO

/* CREATE KPITypes ------------------------------------------------------------------------------------------------------------------*/
CREATE TABLE [dbo].[KPITypes](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_KPITypes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
INSERT INTO [dbo].[KPITypes] VALUES (0, 'Undefined')
INSERT INTO [dbo].[KPITypes] VALUES (1, 'Weak')
INSERT INTO [dbo].[KPITypes] VALUES (2, 'Strong')

/* PREPARATIONS for data integrity on Answers ----------------------------------------------------------------------------------------*/
GO
UPDATE [dbo].[Answers] SET KPIType = 0
WHERE [dbo].[Answers].[KPIType] IS NULL
GO

ALTER TABLE [dbo].[Answers]  WITH CHECK ADD  CONSTRAINT [FK_Answers_KPITypes] FOREIGN KEY([KPIType])
REFERENCES [dbo].[KPITypes] ([Id])
GO

ALTER TABLE [dbo].[Answers] CHECK CONSTRAINT [FK_Answers_KPITypes]
GO

ALTER TABLE [dbo].[EvaluationAgreements]  WITH CHECK ADD  CONSTRAINT [FK_EvaluationAgreements_KPITypes] FOREIGN KEY([KPIType])
REFERENCES [dbo].[KPITypes] ([Id])
GO
ALTER TABLE [dbo].[EvaluationAgreements] CHECK CONSTRAINT [FK_EvaluationAgreements_KPITypes]
GO


/* CREATE Trends NO-LINKS-IN DB-------------------------------------------------------------------------------------------------------*/
CREATE TABLE [dbo].[Trends](
	[Id] [int] NOT NULL,
	[Direction] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_Trends] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

INSERT INTO [dbo].[Trends] VALUES (0, 'Down')
INSERT INTO [dbo].[Trends] VALUES (1, 'Equal')
INSERT INTO [dbo].[Trends] VALUES (2, 'Up')

GO


/* CREATE ReminderTypes --------------------------------------------------------------------------------------------------------------*/
CREATE TABLE [dbo].[ReminderTypes](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_ReminderTypes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

INSERT INTO [dbo].[ReminderTypes] VALUES (0, 'Training')
INSERT INTO [dbo].[ReminderTypes] VALUES (1, 'Evaluate')
INSERT INTO [dbo].[ReminderTypes] VALUES (2, 'SetKPI')
INSERT INTO [dbo].[ReminderTypes] VALUES (3, 'SetFinalKPI')
INSERT INTO [dbo].[ReminderTypes] VALUES (4, 'Profile')
INSERT INTO [dbo].[ReminderTypes] VALUES (5, 'Task')

GO
ALTER TABLE [dbo].[Reminders]  WITH CHECK ADD  CONSTRAINT [FK_Reminders_ReminderTypes] FOREIGN KEY([ReminderType])
REFERENCES [dbo].[ReminderTypes] ([Id])

GO
ALTER TABLE [dbo].[Reminders] CHECK CONSTRAINT [FK_Reminders_ReminderTypes]

GO

INSERT INTO [dbo].[UpdatesHistory] (Version, Description) VALUES ('5.2.2', 'UPDATED: Departments(hierarchical list), ADDED: Projects, ProjectRoles, LinkProjectUsers, KPITypes, Trends, ReminderTypes')
GO

/**************************/
UPDATE [dbo].[Stages]
   SET [dbo].[Stages].[Name] = 'Start Stage'
 WHERE [dbo].[Stages].[Name] = 'Start Profile'
GO
INSERT INTO [dbo].[UpdatesHistory] (Version, Description) VALUES ('5.2.2', 'Rename Start Profile to Start Stage')
GO
