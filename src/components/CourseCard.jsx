import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography
} from '@mui/material';

export const CourseCard = ({ id, title, description, image_url, onClick }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => onClick(id)} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="200"
          image={image_url || 'https://via.placeholder.com/600x400?text=Course'}
          alt={title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
