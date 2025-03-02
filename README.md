# Go This Fast - Running Pace Calculator

Go This Fast is a web application built with Astro and React that helps runners calculate, convert, and estimate running times across various distances based on pace and speed inputs.

## Features

- **Pace and Speed Conversion**: Easily convert between different pace formats (min/km, min/mile) and speed metrics (km/h, mph)
- **Running Time Estimates**: Calculate estimated finish times for standard race distances based on your current pace
- **Interactive Interface**: Simple, intuitive UI with automatic real-time calculations
- **Responsive Design**: Works well on desktop and mobile devices

## Distances Supported

The application supports standard running distances:
- 100m
- 400m
- 1km 
- 1 mile (1.60934 km)
- 5km
- 10km
- Half Marathon (21.0975 km)
- Marathon (42.195 km)

## Technologies Used

- [Astro](https://astro.build/) - Fast, modern static site builder
- [React](https://react.dev/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript for better development experience
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## Getting Started

### Prerequisites
- Node.js (see .nvmrc for recommended version)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/go-this-fast.git
   cd go-this-fast
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321`

## Building for Production

```
npm run build
```

The built files will be in the `dist` directory.

## How It Works

The application calculates running times based on pace (minutes per kilometer). When you enter a time for any distance, the app automatically calculates:

1. Your pace in minutes per kilometer
2. Your pace in minutes per mile
3. Your speed in kilometers per hour
4. Your speed in miles per hour
5. Estimated finish times for all other supported distances

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
