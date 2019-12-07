/*****************************************/
/***** Update Script *********************/
/*****************************************/


/***** [ 16/09/2015] ************************/

/****** Object:  Table [dbo].[UpdatesHistory]    Script Date: 16.09.2015 17:13:55 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[UpdatesHistory](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Date] [datetime] NOT NULL,
	[Description] [nvarchar](max) NULL,
	[Version] [nvarchar](100) NULL,
 CONSTRAINT [PK_UpdatesHistory] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
ALTER TABLE [dbo].[UpdatesHistory] ADD  CONSTRAINT [DF_UpdatesHistory_Date]  DEFAULT (getdate()) FOR [Date]
GO

INSERT INTO [dbo].[UpdatesHistory] (Version, Description) VALUES ('5.1.2', 'Add UpdatesHistory table')
GO


/******* Set initial Culture nb-No for all users **************/

UPDATE Users SET CultureId = (SELECT top 1 Id FROM Cultures WHERE CultureName='nb-NO') WHERE 1=1
GO

INSERT INTO [dbo].[UpdatesHistory] (Version, Description) VALUES ('5.1.2', 'Change CultureId to nb-NO for all users')
GO


/***** [/ 16/09/2015] ************************/


/***** [ 18/09/2015] ************************/


-- Delete duplicated answers from Answers table
; with tab as (
  select * ,row_number() over(partition by ParticipantId, StageId, QuestionId order by Answer) as rn
     from [Answers]

	 )
	 delete from tab where rn> 1
GO

INSERT INTO [dbo].[UpdatesHistory] (Version, Description) VALUES ('5.1.2', 'Delete duplicated answers from Answers table')
GO


/***** [/ 18/09/2015] ************************/
