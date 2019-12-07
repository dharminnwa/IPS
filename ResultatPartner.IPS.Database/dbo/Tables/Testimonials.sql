CREATE TABLE [dbo].[Testimonials] (
    [TestimonialID] INT            IDENTITY (1, 1) NOT NULL,
    [ClientName]    VARCHAR (1000) NULL,
    [Comment]       VARCHAR (MAX)  NULL,
    [Logo]          VARCHAR (1000) NULL,
    [LanguageID]    INT            NULL,
    CONSTRAINT [PK_Testimonials] PRIMARY KEY CLUSTERED ([TestimonialID] ASC)
);

