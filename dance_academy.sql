-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 28, 2020 at 12:54 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dance_academy`
--

-- --------------------------------------------------------

--
-- Table structure for table `contents`
--

CREATE TABLE `contents` (
  `content_ID` int(11) NOT NULL,
  `course_ID` int(11) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `contents`
--

INSERT INTO `contents` (`content_ID`, `course_ID`, `title`, `description`, `filename`) VALUES
(2, 4, 'Cha Cha Footwork', 'In this video, we are going to investigate the basic footwork of cha cha.', 'myContent-1593339517165.mp4'),
(3, 4, 'Basic Cha Cha Routine', 'We will investigate basics of cha cha', 'myContent-1593339545782.mp4'),
(4, 3, 'Waltz Routine', 'We will teach you a new waltz routine', 'myContent-1593339584386.mp4'),
(5, 3, 'Waltz Technique', 'In this video, we will show you how to have the basic technique for waltz.', 'myContent-1593339623391.mp4'),
(6, 1, 'Cha Cha Footwork', 'We will see how to actually perform a good footwork in cha cha.', 'myContent-1593339701540.mp4'),
(7, 1, 'Cha Cha Routine', 'We will see a basic cha cha routine.', 'myContent-1593339724044.mp4');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_ID` int(11) NOT NULL,
  `user_ID` int(11) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `genre` varchar(50) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `publish_date` datetime DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_ID`, `user_ID`, `title`, `genre`, `price`, `description`, `publish_date`, `thumbnail`) VALUES
(1, 1, 'Cha Cha Basics', 'Latin', 15, 'The basic footwork pattern of cha-cha-cha is also found in several Afro-Cuban dances from the Santería religion. For example, one of the steps used in the dance practiced by the Orisha ethnicity’s Ogun religious features an identical pattern of footwork.', '2020-06-28 10:13:47', 'myContent-1593339227049.jpg'),
(3, 2, 'Waltz Basics', 'Standart', 67, 'Waltz is one of the five dances in the Standard (or Modern) category of the International Style ballroom dances. It was previously referred to as slow waltz or English waltz. ', '2020-06-28 10:16:22', 'myContent-1593339382457.jpg'),
(4, 2, 'Tango Course', 'Standard', 15, 'The present day ballroom tango is divided into two disciplines: American Style and International Style. Both styles may be found in social and competitive dances, but the International version is more globally accepted as a competitive style.', '2020-06-28 10:17:05', 'myContent-1593339425070.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_ID` int(11) NOT NULL,
  `course_ID` int(11) DEFAULT NULL,
  `user_ID` int(11) DEFAULT NULL,
  `order_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_ID` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `isInstructor` varchar(50) DEFAULT NULL,
  `description` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_ID`, `first_name`, `last_name`, `email`, `password`, `isInstructor`, `description`) VALUES
(1, 'Aral', 'Yucel', 'aral@yucel.com', '$2a$08$aERtld9gW.oQ81bl2TBkeeBHZYUCfN5nN.fuCJpn7nIBSV3AmVSyW', '1', 'Best Instructore for Cha Cha'),
(2, 'Hamza', 'Sahin', 'hamiissah@gmail.com', '$2a$08$OHTuXgcPjSRxgIO6Y7cY2OWTQV41salZD0SorCO0KF4wnT.0dZsES', '1', 'One of the best Standart teachers alive.'),
(3, 'Cuneyd', 'Tantug', 'cuneyd@tantug.com', '$2a$08$CW3YDGXMx0Zf6F3ZV1e0y.JVgSGdPD7KgwLunhQEcYuPJTPwuhjw6', '1', 'The best Samba teacher.');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contents`
--
ALTER TABLE `contents`
  ADD PRIMARY KEY (`content_ID`),
  ADD KEY `course_ID` (`course_ID`),
  ADD KEY `Key` (`title`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_ID`),
  ADD KEY `user_ID` (`user_ID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_ID`),
  ADD KEY `course_ID` (`course_ID`),
  ADD KEY `user_ID` (`user_ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contents`
--
ALTER TABLE `contents`
  MODIFY `content_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contents`
--
ALTER TABLE `contents`
  ADD CONSTRAINT `contents_ibfk_1` FOREIGN KEY (`course_ID`) REFERENCES `courses` (`course_ID`);

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`course_ID`) REFERENCES `courses` (`course_ID`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
