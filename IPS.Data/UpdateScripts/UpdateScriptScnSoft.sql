/*****************************************/
/***** Update Script *********************/
/*****************************************/


/***** [ 03/16/2016] ************************/


/*CREATE ExerciseMetrics---------------------------------------------------------------------------------------------------------------------*/

CREATE TABLE [dbo].[ExerciseMetrics](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](max) NULL,
 CONSTRAINT [PK_ExerciseMetrics] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

INSERT INTO [dbo].[ExerciseMetrics] VALUES ('gr')
INSERT INTO [dbo].[ExerciseMetrics] VALUES ('kg')
INSERT INTO [dbo].[ExerciseMetrics] VALUES ('mm')
INSERT INTO [dbo].[ExerciseMetrics] VALUES ('cm')
INSERT INTO [dbo].[ExerciseMetrics] VALUES ('m')
INSERT INTO [dbo].[ExerciseMetrics] VALUES ('km')

GO

/*ALTER Trainings---------------------------------------------------------------------------------------------------------------------*/

ALTER TABLE [dbo].[Trainings]
  ADD  	HowMany int,
		ExerciseMetricId int,
		HowManySets int,
		HowManyActions int
	  
ALTER TABLE [dbo].[Trainings]  WITH CHECK ADD  CONSTRAINT [FK_Trainings_ExerciseMetrics] FOREIGN KEY([ExerciseMetricId])
REFERENCES [dbo].[ExerciseMetrics] ([Id])
GO

ALTER TABLE [dbo].[Trainings] CHECK CONSTRAINT [FK_Trainings_ExerciseMetrics]
GO

