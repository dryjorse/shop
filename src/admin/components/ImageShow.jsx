import React from "react";
import { Box, Label } from "@adminjs/design-system";

const ImagePreview = (props) => {
  const { record, property } = props;

  console.log(record?.params, property);

  if (!record?.params[property.path]) {
    return <Box>Изображения отсутствуют</Box>;
  }

  let images = [];

  try {
    // Проверяем, массив это или строка JSON
    if (typeof record.params[property.path] === "string") {
      images = JSON.parse(record.params[property.path] || "[]");
    } else {
      images = record.params[property.path] || [];
    }
  } catch (e) {
    // Если не получилось распарсить, возможно это строка с одним URL
    images = [record.params[property.path]];
  }

  return (
    <Box>
      <Label>{property.label}</Label>
      <Box>
        {images.map((img, index) => (
          <Box key={index} marginBottom="default">
            <img
              src={
                img.includes("http")
                  ? img
                  : `${
                      process.env.BASE_URL || "http://localhost:4000"
                    }/products/${img}`
              }
              alt={`Изображение ${index + 1}`}
              style={{ maxWidth: "100%", maxHeight: "300px" }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImagePreview;
